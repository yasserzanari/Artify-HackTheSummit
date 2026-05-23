import type { STTResult } from '@/types/narration'

export interface STTService {
  startRecording(): Promise<void>
  stopRecording(): Promise<STTResult>
  cancel(): void
  isRecording(): boolean
}
