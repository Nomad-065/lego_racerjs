/**
 * HUD.jsx — Tailwind v4
 * Speed/RPM/Gear: ref-polled at 100ms (no 60fps re-renders)
 * Lap/Position/Phase: Zustand subscriptions (event-driven)
 */

import {useState, useEffect} from 'react'
import {readTelemetry} from '../systems/raceManager'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore'

function Speedo({speed, maxSpeed = 28}) {
  const pct = Math.min(speed / maxSpeed, 1)
  const angle = -140 + pct * 280
  const kmh = Math.round(speed * 3.6)

  return (
    <div className="relative w-28 h-28">
      <svg viewBox="0 0 120 120" width="120" height="120">
        <path d="M 15 95 A 55 55 0 1 1 105 95" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6"
              strokeLinecap="round"/>
        <path d="M 15 95 A 55 55 0 1 1 105 95" fill="none" stroke="#e63946" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${pct * 259} 259`}/>
        <line
          x1="60" y1="60"
          x2={60 + Math.cos((angle - 90) * Math.PI / 180) * 40}
          y2={60 + Math.sin((angle - 90) * Math.PI / 180) * 40}
          stroke="white" strokeWidth="2" strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="4" fill="white"/>
      </svg>
      <div className="absolute bottom-5 w-full text-center  font-bold text-[22px] text-white glow-red">
        {kmh}
      </div>
      <div className="absolute bottom-1.5 w-full text-center text-[10px]  tracking-[0.2em] text-text-muted">
        KM/H
      </div>
    </div>
  )
}

function RpmBar({rpm, gear}) {
  const pct = Math.min(rpm / 7000, 1)
  const redline = rpm > 5500

  return (
    <div className="w-48">
      <div className="flex justify-between mb-1">
        <span className="text-[11px]  tracking-wide text-text-muted">RPM</span>
        <span className={`text-[11px] ${redline ? 'text-race-red' : 'text-text-muted'}`}>
          {Math.round(rpm)}
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.08] rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-[width] duration-[50ms] linear"
          style={{
            width: `${pct * 100}%`,
            background: redline
              ? 'linear-gradient(90deg, #e63946, #ff006e)'
              : 'linear-gradient(90deg, #4cc9f0, #7209b7)',
          }}
        />
      </div>
      <div className="text-center mt-1.5">
        <span className="text-[28px] font-black  text-white leading-none glow-blue">{gear}</span>
        <span className="text-[10px]  text-text-muted ml-0.5">GEAR</span>
      </div>
    </div>
  )
}

function LapCounter({lap, totalLaps, position, total}) {
  return (
    <div className="text-center">
      <div className="text-[11px]  tracking-[0.2em] text-text-muted mb-0.5">LAP</div>
      <div className="text-[32px] font-black  text-white leading-none">
        {Math.min(lap + 1, totalLaps)}
        <span className="text-[16px] text-text-muted">/{totalLaps}</span>
      </div>
      <div className={`mt-1 text-[11px]  tracking-wide ${position === 1 ? 'text-gold' : 'text-text-muted'}`}>
        P{position}/{total}
      </div>
    </div>
  )
}

function Leaderboard({standings}) {
  if (!standings.length) return null
  return (
    <div
      className="absolute top-5 right-5 bg-black/60 rounded-lg px-3.5 py-2.5 min-w-[140px] backdrop-blur-sm border border-white/[0.08]">
      <div className="text-[10px]  tracking-[0.2em] text-text-muted mb-1.5">STANDINGS</div>
      {standings.map((s, i) => (
        <div
          key={s.id}
          className={`flex gap-2 items-center py-0.5 text-[12px] ${s.isPlayer ? 'text-race-red font-bold' : 'text-white/70'}`}
        >
          <span className="w-4 text-white/30">P{i + 1}</span>
          <span>{s.isPlayer ? '▶ YOU' : `AI ${s.id}`}</span>
          <span className="ml-auto text-[10px] text-text-muted">L{s.lap}</span>
        </div>
      ))}
    </div>
  )
}

function CountdownOverlay({value}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`font-black leading-none tracking-[-4px] animate-countdown ${value === 0 ? 'text-gold glow-gold' : 'text-white'}`}
        style={{fontSize: value === 0 ? '80px' : '120px'}}
      >
        {value === 0 ? 'GO!' : value}
      </div>
    </div>
  )
}

function FinishedOverlay({position, onRestart, onMenu}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/[0.82] pointer-events-auto">
      <div className={`text-[64px] font-black  mb-2 glow-gold text-gold`}>
        {position === 1 ? '🏆 1ST!' : `P${position}`}
      </div>
      <div className="text-lg tracking-[0.15em] text-white/60 mb-10">
        {position === 1 ? 'RACE COMPLETE' : 'RACE FINISHED'}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="px-8 py-3 text-[13px]  font-bold tracking-[0.15em] text-white bg-race-red border-none rounded-md cursor-pointer hover:-translate-y-0.5 transition-transform"
          style={{boxShadow: '0 0 20px rgba(230,57,70,0.4)'}}
        >
          RACE AGAIN
        </button>
        <button
          onClick={onMenu}
          className="px-8 py-3 text-[13px]  font-bold tracking-[0.15em] text-white/70 bg-transparent border border-white/20 rounded-md cursor-pointer hover:text-white hover:border-white/40 transition-colors"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  )
}

export function HUD() {
  const [telemetry, setTelemetry] = useState({speed: 0, rpm: 0, gear: 1})

  const screen = useGameStore((s) => s.screen)
  const countdownValue = useGameStore((s) => s.countdownValue)
  const totalLaps = useGameStore((s) => s.totalLaps)
  const standings = useGameStore((s) => s.standings)
  const lapsComplete = useGameStore((s) => s.lapData[0]?.lapsComplete ?? 0)
  const resetRace = useGameStore((s) => s.resetRace)
  const goToMainMenu = useGameStore((s) => s.goToMainMenu)

  useEffect(() => {
    const interval = setInterval(() => {
      const t = readTelemetry(0)
      if (t) setTelemetry({speed: t.speed, rpm: t.rpm, gear: t.gear})
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const playerStanding = standings.find((s) => s.isPlayer)
  const position = playerStanding?.racePos ?? 1

  return (
    <>
      {/* Bottom instrument cluster */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/65 rounded-2xl px-6 py-3 backdrop-blur-md border border-white/[0.08]">
        <LapCounter lap={lapsComplete} totalLaps={totalLaps} position={position} total={6}/>
        <div className="w-px h-14 bg-white/10"/>
        <Speedo speed={telemetry.speed}/>
        <div className="w-px h-14 bg-white/10"/>
        <RpmBar rpm={telemetry.rpm} gear={telemetry.gear}/>
      </div>

      <Leaderboard standings={standings}/>

      {screen === APP_SCREENS.COUNTDOWN && <CountdownOverlay value={countdownValue}/>}
      {screen === APP_SCREENS.FINISHED &&
        <FinishedOverlay position={position} onRestart={resetRace} onMenu={goToMainMenu}/>}
    </>
  )
}