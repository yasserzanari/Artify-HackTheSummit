'use client'

import type { QASession } from '@/types/narration'

interface QAInterfaceProps {
  session: QASession
  onStopListening: () => void
  onAskAnother: () => void
  onDone: () => void
  onSkipTour: () => void
}

export function QAInterface({
  session,
  onStopListening,
  onAskAnother,
  onDone,
  onSkipTour,
}: QAInterfaceProps) {
  const lastAnswer = [...session.turns].reverse().find((t) => t.role === 'guide')?.text ?? ''

  const statusLabel =
    session.status === 'listening' ? 'Listening…' :
    session.status === 'transcribing' ? 'Processing…' :
    session.status === 'thinking' ? 'Finding an answer…' :
    session.status === 'answering' ? 'Answer:' :
    ''

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Question and answer"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.93)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001,
        padding: '2rem',
        gap: '1.5rem',
      }}
    >
      {/* Status */}
      <p
        aria-live="assertive"
        style={{
          color: '#fff',
          fontSize: '1.25rem',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {statusLabel}
      </p>

      {/* Listening indicator */}
      {session.status === 'listening' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div
            aria-hidden="true"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#e03131',
              animation: 'qa-pulse 1s ease-in-out infinite',
            }}
          />
          <button
            onClick={onStopListening}
            style={{
              minWidth: 200,
              minHeight: 60,
              fontSize: '1.1rem',
              background: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Tap when done asking
          </button>
        </div>
      )}

      {/* Thinking indicator */}
      {(session.status === 'thinking' || session.status === 'transcribing') && (
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%',
            animation: 'qa-spin 0.8s linear infinite',
          }}
        />
      )}

      {/* Answer display */}
      {session.status === 'answering' && lastAnswer && (
        <p
          style={{
            color: '#fff',
            fontSize: '1.15rem',
            textAlign: 'center',
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          {lastAnswer}
        </p>
      )}

      {/* Post-answer actions */}
      {session.status === 'answering' && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={onAskAnother} style={actionBtnStyle}>
            Ask another
          </button>
          <button onClick={onDone} style={actionBtnStyle}>
            Done
          </button>
          <button onClick={onSkipTour} style={{ ...actionBtnStyle, borderColor: 'rgba(255,255,255,0.4)' }}>
            Skip tour section
          </button>
        </div>
      )}

      {/* Always-visible exit */}
      {session.status !== 'answering' && (
        <button
          onClick={onDone}
          aria-label="Exit Q&A"
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 6,
            minWidth: 48,
            minHeight: 48,
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}

      <style>{`
        @keyframes qa-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }
        @keyframes qa-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const actionBtnStyle: React.CSSProperties = {
  minWidth: 140,
  minHeight: 52,
  fontSize: '1rem',
  background: 'transparent',
  color: '#fff',
  border: '2px solid #fff',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
}
