/**
 * MainMenu.jsx — Tailwind v4
 */

import { useState, useEffect } from 'react'
import { useGameStore, APP_SCREENS } from '../stores/useGameStore'

function SpeedLines() {
  const lines = Array.from({ length: 18 }, (_, i) => ({
    top:     `${(i / 18) * 100}%`,
    width:   `${30 + ((i * 37) % 50)}%`,
    delay:   `${(i * 0.17) % 2}s`,
    dur:     `${0.6 + (i * 0.11) % 0.8}s`,
    opacity: 0.03 + (i * 0.003),
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {lines.map((l, i) => (
        <div
          key={i}
          className="absolute h-px right-0 animate-speedline"
          style={{
            top: l.top, width: l.width,
            background: 'linear-gradient(90deg, transparent, rgba(230,57,70,0.8), transparent)',
            opacity: l.opacity,
            animationDuration: l.dur,
            animationDelay: l.delay,
          }}
        />
      ))}
    </div>
  )
}

function MenuItem({ label, sub, onClick, delay = 0, disabled = false }) {
  const [hovered, setHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="block w-full text-left bg-transparent border-none cursor-pointer py-3.5 relative outline-none"
      style={{
        opacity:    mounted ? (disabled ? 0.3 : 1) : 0,
        transform:  mounted ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        cursor:     disabled ? 'default' : 'pointer',
      }}
    >
      {/* Hover line */}
      <div
        className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-race-red"
        style={{
          left: '-24px',
          width: hovered ? '16px' : '0px',
          boxShadow: '0 0 8px #e63946',
          transition: 'width 0.2s ease',
        }}
      />
      <div
        className="font-mono font-black leading-none tracking-tight"
        style={{
          fontSize: 'clamp(28px, 4vw, 40px)',
          color: hovered ? '#e63946' : 'white',
          textShadow: hovered ? '0 0 30px rgba(230,57,70,0.4)' : 'none',
          transition: 'color 0.15s ease',
        }}
      >
        {label}
      </div>
      {sub && (
        <div className="text-[11px] tracking-[0.2em] mt-0.5 text-text-muted font-mono">
          {sub}
        </div>
      )}
    </button>
  )
}

export function MainMenu() {
  const screen    = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)

  if (screen !== APP_SCREENS.MAIN_MENU) return null

  return (
    <div className="fixed inset-0 z-50 bg-cockpit overflow-hidden scanlines">
      <SpeedLines />

      {/* Right diagonal accent */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-5%] w-[70%] h-[120%] opacity-[0.08]"
          style={{
            background: 'linear-gradient(160deg, #e63946 0%, #9d0208 100%)',
            clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute top-[-10%] w-0.5 h-[120%]"
            style={{
              right: `${20 + i * 8}%`,
              background: `rgba(230,57,70,${0.15 - i * 0.04})`,
              transform: 'rotate(-15deg)',
              transformOrigin: 'top',
            }}
          />
        ))}
      </div>

      {/* Left content */}
      <div className="absolute left-0 top-0 bottom-0 w-[55%] flex flex-col justify-center px-12">
        {/* Logo */}
        <div className="mb-14 animate-fadein">
          <div className="text-[11px] tracking-[0.5em] text-race-red font-mono mb-2">
            ── NITRO DIGITAL
          </div>
          <div
            className="font-mono font-black text-white leading-[0.9] tracking-[-4px]"
            style={{ fontSize: 'clamp(56px, 10vw, 96px)' }}
          >
            APEX<br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
              RUSH
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-0.5 bg-race-red mb-10 animate-fadein"
          style={{ boxShadow: '0 0 12px #e63946', animationDelay: '0.1s' }}
        />

        {/* Nav */}
        <div className="pl-6">
          <MenuItem label="RACE"     sub="SELECT TRACK & START"       delay={400} onClick={() => setScreen(APP_SCREENS.RACE_SELECT)} />
          <MenuItem label="SETTINGS" sub="AUDIO, GRAPHICS, CONTROLS"  delay={520} onClick={() => setScreen(APP_SCREENS.SETTINGS)} />
          <MenuItem label="GARAGE"   sub="COMING SOON"                delay={640} disabled />
          <MenuItem label="QUIT"     sub="CLOSE GAME"                 delay={760} onClick={() => window.close()} />
        </div>
      </div>

      {/* Build info */}
      <div className="absolute bottom-6 left-12 text-[10px] tracking-[0.2em] text-text-dim font-mono">
        APEX RUSH v0.1.0 · BUILD 2024
      </div>
    </div>
  )
}
