import { audioLogger } from '@/services/audio/AudioLogger'
import type { STTResult, STTOptions } from '@/types/narration'
import type { STTService } from './STTService'

const SILENCE_THRESHOLD_BYTES = 1000
const MAX_RECORDING_MS = 30_000

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export class GCPSpeechToTextService implements STTService {
  private _recorder: MediaRecorder | null = null
  private _chunks: Blob[] = []
  private _recording = false
  private _maxDurationTimer: ReturnType<typeof setTimeout> | null = null
  private _stopCallback: (() => void) | null = null

  constructor(private readonly options: STTOptions = {}) {}

  async startRecording(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    this._recorder = new MediaRecorder(stream, { mimeType })
    this._chunks = []

    this._recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this._chunks.push(e.data)
    }

    this._recorder.start()
    this._recording = true
    audioLogger.log('INFO', 'GCP-STT', 'recording started')

    this._maxDurationTimer = setTimeout(() => {
      if (this._recording) {
        audioLogger.log('WARN', 'GCP-STT', 'recording auto-stopped after 30s max duration')
        this._stopCallback?.()
      }
    }, MAX_RECORDING_MS)
  }

  stopRecording(): Promise<STTResult> {
    return new Promise((resolve, reject) => {
      if (!this._recorder) {
        reject(new Error('Not recording'))
        return
      }

      if (this._maxDurationTimer) {
        clearTimeout(this._maxDurationTimer)
        this._maxDurationTimer = null
      }

      this._stopCallback = null

      this._recorder.onstop = async () => {
        this._recording = false
        const blob = new Blob(this._chunks, { type: 'audio/webm' })
        audioLogger.log('INFO', 'GCP-STT', `recording stopped, size: ${blob.size} bytes`)

        this._recorder?.stream.getTracks().forEach((t) => t.stop())

        if (blob.size < SILENCE_THRESHOLD_BYTES) {
          audioLogger.log('WARN', 'GCP-STT', 'audio too short — skipping API call')
          resolve({ transcript: '', confidence: 0, isFinal: true })
          return
        }

        try {
          const base64 = await blobToBase64(blob)
          const res = await fetch('/api/stt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64,
              config: {
                languageCode: this.options.languageCode ?? 'en-US',
                sampleRateHertz: this.options.sampleRateHertz ?? 48000,
                enableAutomaticPunctuation: this.options.enableAutomaticPunctuation ?? true,
                maxAlternatives: this.options.maxAlternatives ?? 1,
              },
            }),
          })

          if (!res.ok) {
            throw new Error(`STT API error: ${res.status}`)
          }

          const data = await res.json()
          const transcript: string = data.results?.[0]?.alternatives?.[0]?.transcript ?? ''
          const confidence: number = data.results?.[0]?.alternatives?.[0]?.confidence ?? 0

          if (!transcript) {
            audioLogger.log('WARN', 'GCP-STT', 'empty transcript — no speech detected')
          } else {
            audioLogger.log('INFO', 'GCP-STT', `transcript: "${transcript}" (confidence: ${confidence.toFixed(2)})`)
          }

          resolve({ transcript, confidence, isFinal: true })
        } catch (err) {
          audioLogger.log('ERROR', 'GCP-STT', `transcription failed: ${err}`)
          reject(err)
        }
      }

      this._recorder.stop()
    })
  }

  cancel(): void {
    if (this._maxDurationTimer) {
      clearTimeout(this._maxDurationTimer)
      this._maxDurationTimer = null
    }
    if (this._recorder && this._recording) {
      this._recorder.stream.getTracks().forEach((t) => t.stop())
      this._recorder.ondataavailable = null
      this._recorder.onstop = null
      try { this._recorder.stop() } catch { /* already stopped */ }
      this._recording = false
      audioLogger.log('INFO', 'GCP-STT', 'cancelled by user')
    }
  }

  isRecording(): boolean {
    return this._recording
  }
}
