'use client'

import { useState, useCallback } from 'react'
import { artworks } from '@/data/artworks'
import { ttsService } from '@/services/tts'
import { sttService } from '@/services/stt'
import { geminiService } from '@/services/ai'
import { useNarrationQueue } from '@/hooks/accessibility/useNarrationQueue'
import { useArtworkQA } from '@/hooks/accessibility/useArtworkQA'
import { ConsentGate } from './ConsentGate'
import { AccessibilityAudioBar } from './AccessibilityAudioBar'
import { QAInterface } from './QAInterface'
import type { ArtworkConfig } from '@/types/ar'

export default function AccessibilityOverlay() {
  const [open, setOpen] = useState(false)
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkConfig | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [rate, setRate] = useState(1)
  const [showQA, setShowQA] = useState(false)

  const narrationQueue = useNarrationQueue(ttsService)
  const { state, narrationHistory, start, pause, resume, stop, skipToNext, answerConsent } = narrationQueue

  const qa = useArtworkQA({
    artwork: selectedArtwork ?? artworks[0],
    narrationHistory,
    ttsService,
    sttService,
    geminiService,
    currentSegmentIndex: state.currentSegmentIndex,
  })

  const handleSelectArtwork = useCallback((artwork: ArtworkConfig) => {
    setSelectedArtwork(artwork)
    setIsPaused(false)
    start(artwork.id)
  }, [start])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    pause()
  }, [pause])

  const handleResume = useCallback(() => {
    setIsPaused(false)
    resume()
  }, [resume])

  const handleStop = useCallback(() => {
    stop()
    setSelectedArtwork(null)
    setIsPaused(false)
    setShowQA(false)
  }, [stop])

  const handleRateChange = useCallback((newRate: number) => {
    setRate(newRate)
    ttsService.setRate?.(newRate)
  }, [])

  const handleOpenQA = useCallback(async () => {
    setShowQA(true)
    pause()
    await qa.startQA()
    setShowQA(false)
    resume()
  }, [qa, pause, resume])

  const handleConsentAnswer = useCallback((yes: boolean) => {
    if (yes && state.status === 'qa-offer') {
      handleOpenQA()
    } else {
      answerConsent(yes)
    }
  }, [state.status, answerConsent, handleOpenQA])

  const isNarrating = state.status !== 'idle' && state.status !== 'completed'
  const showConsentGate = state.status === 'consent' || state.status === 'qa-offer'

  return (
    <>
      {/* Toggle button — always visible on /ar */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close accessibility mode' : 'Open accessibility mode'}
        aria-pressed={open}
        style={{
          position: 'fixed',
          top: '1rem',
          right: '1rem',
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: open ? '#fff' : 'rgba(0,0,0,0.7)',
          color: open ? '#000' : '#fff',
          border: '2px solid rgba(255,255,255,0.6)',
          fontSize: '1.5rem',
          cursor: 'pointer',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ♿
      </button>

      {/* Artwork picker */}
      {open && !isNarrating && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Choose an artwork for narration"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 997,
            padding: '2rem',
            gap: '1.5rem',
          }}
        >
          <h2 style={{ color: '#fff', fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            Choose an artwork to hear about
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 400 }}>
            Select the artwork you are standing in front of. The audio guide will describe it and its history.
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
              maxWidth: 480,
            }}
          >
            {artworks.map((artwork) => (
              <button
                key={artwork.id}
                onClick={() => { setOpen(false); handleSelectArtwork(artwork) }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  padding: '1.25rem 1.5rem',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  minHeight: 72,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{artwork.title}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', marginTop: 4 }}>
                  {artwork.artist} · {artwork.year}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close accessibility panel"
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.5)',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Consent gate */}
      {showConsentGate && !showQA && (
        <ConsentGate
          question={
            state.status === 'qa-offer'
              ? 'Would you like to ask a question about this artwork?'
              : 'Would you like to continue to the next section?'
          }
          onAnswer={handleConsentAnswer}
        />
      )}

      {/* Q&A interface */}
      {showQA && (
        <QAInterface
          session={qa.session}
          onStopListening={qa.stopListening}
          onAskAnother={() => qa.startQA()}
          onDone={() => { qa.exitQA(); setShowQA(false); resume() }}
          onSkipTour={() => { qa.exitQA(); setShowQA(false); skipToNext('button') }}
        />
      )}

      {/* Narration audio bar */}
      {isNarrating && !showQA && (
        <AccessibilityAudioBar
          state={state}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onSkip={() => skipToNext('button')}
          onOpenQA={handleOpenQA}
          isPaused={isPaused}
          rate={rate}
          onRateChange={handleRateChange}
        />
      )}
    </>
  )
}
