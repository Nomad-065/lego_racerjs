/**
 * StartScreen.jsx — Pre-race overlay
 */

import { useGameStore, RACE_PHASES } from '../stores/useGameStore'

export function StartScreen() {
  const phase          = useGameStore((s) => s.phase)
  const startCountdown = useGameStore((s) => s.startCountdown)

  if (phase !== RACE_PHASES.PRE_RACE) return null

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.82)',
      zIndex: 10,
    }}>
      <div style={{
        fontSize: 72, fontWeight: 900, fontFamily: 'monospace',
        color: '#e63946', letterSpacing: -2,
        textShadow: '0 0 60px rgba(230,57,70,0.5)',
        marginBottom: 8,
      }}>
        RACE
      </div>
      <div style={{
        fontSize: 14, color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace', letterSpacing: 6, marginBottom: 48,
      }}>
        3 LAPS · 6 CARS
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 32px',
        marginBottom: 48, fontSize: 12, fontFamily: 'monospace',
        color: 'rgba(255,255,255,0.5)',
      }}>
        {[
          ['W / ↑', 'Accelerate'],
          ['S / ↓', 'Reverse'],
          ['A / ←', 'Steer Left'],
          ['D / →', 'Steer Right'],
          ['SPACE', 'Brake'],
          ['SHIFT', 'Boost'],
        ].map(([key, action]) => (
          <div key={key} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{
              background: 'rgba(255,255,255,0.08)', padding: '3px 10px',
              borderRadius: 4, color: 'white', fontSize: 11, minWidth: 52, textAlign: 'center',
            }}>
              {key}
            </span>
            <span>{action}</span>
          </div>
        ))}
      </div>

      <button
        onClick={startCountdown}
        style={{
          padding: '14px 48px', fontSize: 18, fontFamily: 'monospace',
          fontWeight: 700, letterSpacing: 3, background: '#e63946',
          border: 'none', borderRadius: 8, color: 'white', cursor: 'pointer',
          boxShadow: '0 0 30px rgba(230,57,70,0.4)',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)'
          e.target.style.boxShadow = '0 0 40px rgba(230,57,70,0.6)'
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)'
          e.target.style.boxShadow = '0 0 30px rgba(230,57,70,0.4)'
        }}
      >
        START RACE
      </button>
    </div>
  )
}
