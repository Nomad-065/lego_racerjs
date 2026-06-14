/**
 * RaceSelectScreen.jsx — Tailwind v4
 */

import {useState} from 'react'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore'

const TRACKS = [
  {
    id: 0, name: 'OVAL CIRCUIT', location: 'Nevada Desert',
    length: '4.2 km', turns: 4, difficulty: 'Beginner',
    description: 'A high-speed oval with wide corners. Perfect for learning the fundamentals.',
    gradient: 'linear-gradient(135deg, #1a0505 0%, #3d0f0f 50%, #1a0505 100%)',
    accent: '#e63946', unlocked: true,
  },
  {
    id: 1, name: 'CITY STREETS', location: 'Neo Tokyo',
    length: '3.8 km', turns: 14, difficulty: 'Intermediate',
    description: 'Tight chicanes and long straights through neon-lit urban sprawl.',
    gradient: 'linear-gradient(135deg, #050d1a 0%, #0d1f3d 50%, #050d1a 100%)',
    accent: '#4cc9f0', unlocked: true,
  },
  {
    id: 2, name: 'MOUNTAIN PASS', location: 'Swiss Alps',
    length: '6.1 km', turns: 22, difficulty: 'Expert',
    description: 'Elevation changes and hairpins demand perfect braking points.',
    gradient: 'linear-gradient(135deg, #051a12 0%, #0d3d2a 50%, #051a12 100%)',
    accent: '#06d6a0', unlocked: false,
  },
  {
    id: 3, name: 'NIGHT HARBOR', location: 'Dubai Marina',
    length: '5.3 km', turns: 18, difficulty: 'Hard',
    description: 'Waterfront curves under floodlights. Wet patches in sector 2.',
    gradient: 'linear-gradient(135deg, #1a0d00 0%, #3d2200 50%, #1a0d00 100%)',
    accent: '#f77f00', unlocked: false,
  },
]

const DIFFICULTY_OPTIONS = [
  {key: 'easy', label: 'ROOKIE', sub: 'AI brakes early, forgiving physics'},
  {key: 'medium', label: 'PRO', sub: 'Balanced AI, realistic handling'},
  {key: 'hard', label: 'ELITE', sub: 'Aggressive AI, precise inputs needed'},
]

function TrackCard({track, selected, onClick}) {
  const [hovered, setHovered] = useState(false)
  const active = selected || hovered

  return (
    <button
      onClick={track.unlocked ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-lg p-5 text-left outline-none transition-all duration-200"
      style={{
        background: active ? track.gradient : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? track.accent : 'rgba(255,255,255,0.08)'}`,
        cursor: track.unlocked ? 'pointer' : 'not-allowed',
        boxShadow: selected ? `0 0 24px ${track.accent}30` : 'none',
        opacity: track.unlocked ? 1 : 0.4,
      }}
    >
      {/* Selected dot */}
      {selected && (
        <div
          className="absolute top-3 right-3 w-2 h-2 rounded-full"
          style={{background: track.accent, boxShadow: `0 0 8px ${track.accent}`}}
        />
      )}
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 transition-opacity duration-200"
        style={{background: track.accent, opacity: active ? 1 : 0.3}}
      />
      <div className=" font-bold text-[15px] tracking-wide mb-1"
           style={{color: active ? 'white' : 'rgba(255,255,255,0.7)'}}>
        {track.name}
      </div>
      <div className="text-[10px]  tracking-[0.2em] mb-2.5" style={{color: track.accent}}>
        {track.location}
      </div>
      <div className="flex gap-3 text-[10px] text-text-muted ">
        <span>{track.length}</span><span>·</span>
        <span>{track.turns} TURNS</span><span>·</span>
        <span>{track.difficulty}</span>
      </div>
      {!track.unlocked && (
        <div className="mt-2 text-[9px] text-white/25  tracking-[0.2em]">🔒 LOCKED</div>
      )}
    </button>
  )
}

function LapSelector({value, onChange}) {
  return (
    <div className="flex gap-2">
      {[1, 3, 5, 10].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className="px-4 py-2 rounded text-sm text-white cursor-pointer outline-none transition-all duration-150"
          style={{
            background: value === n ? '#e63946' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${value === n ? '#e63946' : 'rgba(255,255,255,0.1)'}`,
            fontWeight: value === n ? 700 : 400,
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

function DifficultySelector({value, onChange}) {
  return (
    <div className="flex gap-2">
      {DIFFICULTY_OPTIONS.map((d) => (
        <button
          key={d.key}
          onClick={() => onChange(d.key)}
          className="flex-1 p-2.5 text-left rounded-md cursor-pointer outline-none transition-all duration-150"
          style={{
            background: value === d.key ? 'rgba(230,57,70,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${value === d.key ? '#e63946' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <div className="text-[12px] font-bold tracking-wide mb-0.5"
               style={{color: value === d.key ? '#e63946' : 'rgba(255,255,255,0.7)'}}>
            {d.label}
          </div>
          <div className="text-[9px] text-text-muted">{d.sub}</div>
        </button>
      ))}
    </div>
  )
}

export function RaceSelectScreen() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const setRaceConfig = useGameStore((s) => s.setRaceConfig)
  const startCountdown = useGameStore((s) => s.startCountdown)
  const initTrack = useGameStore((s) => s.selectedTrack)
  const initLaps = useGameStore((s) => s.totalLaps)
  const initDifficulty = useGameStore((s) => s.difficulty)

  const [trackId, setTrackId] = useState(initTrack)
  const [laps, setLaps] = useState(initLaps)
  const [difficulty, setDifficulty] = useState(initDifficulty)

  if (screen !== APP_SCREENS.RACE_SELECT) return null

  const selectedTrack = TRACKS.find((t) => t.id === trackId) ?? TRACKS[0]

  const handleStart = () => {
    setRaceConfig({totalLaps: laps, selectedTrack: trackId, difficulty})
    startCountdown()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-cockpit flex flex-col  overflow-y-auto"
      style={{padding: 'clamp(24px, 4vh, 48px) clamp(24px, 5vw, 80px)'}}
    >
      {/* Header */}
      <div className="flex items-center gap-5 mb-10 pb-5 border-b border-white/[0.06]">
        <button
          onClick={() => setScreen(APP_SCREENS.MAIN_MENU)}
          className="text-[11px] tracking-[0.15em] text-text-muted border border-border rounded px-3.5 py-1.5 bg-transparent cursor-pointer hover:text-white hover:border-white/30 transition-colors outline-none"
        >
          ← BACK
        </button>
        <div>
          <div className="text-xl font-black text-white tracking-[-1px]">SELECT RACE</div>
          <div className="text-[10px] tracking-[0.25em] text-text-muted">TRACK · LAPS · DIFFICULTY</div>
        </div>
      </div>

      <div className="grid gap-8 flex-1" style={{gridTemplateColumns: '1fr 340px'}}>
        {/* Left */}
        <div>
          <div className="text-[10px] tracking-[0.25em] text-text-muted mb-3">TRACK</div>
          <div className="grid grid-cols-2 gap-2.5 mb-8">
            {TRACKS.map((t) => (
              <TrackCard key={t.id} track={t} selected={trackId === t.id} onClick={() => setTrackId(t.id)}/>
            ))}
          </div>

          <div className="text-[10px] tracking-[0.25em] text-text-muted mb-2.5">LAPS</div>
          <LapSelector value={laps} onChange={setLaps}/>

          <div className="text-[10px] tracking-[0.25em] text-text-muted mt-6 mb-2.5">DIFFICULTY</div>
          <DifficultySelector value={difficulty} onChange={setDifficulty}/>
        </div>

        {/* Right: track info panel */}
        <div
          className="rounded-xl p-7 flex flex-col sticky top-0"
          style={{
            background: selectedTrack.gradient,
            border: `1px solid ${selectedTrack.accent}20`,
          }}
        >
          <div
            className="w-8 h-0.5 mb-5 rounded-sm"
            style={{background: selectedTrack.accent, boxShadow: `0 0 12px ${selectedTrack.accent}`}}
          />
          <div className="text-[11px] tracking-[0.25em] mb-1.5" style={{color: selectedTrack.accent}}>
            {selectedTrack.location.toUpperCase()}
          </div>
          <div className="text-2xl font-black text-white tracking-[-1px] mb-4">
            {selectedTrack.name}
          </div>
          <div className="text-[12px] text-white/50 leading-relaxed mb-7">
            {selectedTrack.description}
          </div>

          {[
            ['CIRCUIT LENGTH', selectedTrack.length],
            ['TURNS', selectedTrack.turns],
            ['DIFFICULTY', selectedTrack.difficulty],
            ['LAPS', laps],
            ['CARS', 6],
          ].map(([label, val]) => (
            <div key={label} className="flex justify-between py-2 border-b border-white/[0.06] text-[11px]">
              <span className="tracking-[0.15em] text-white/35">{label}</span>
              <span className="text-white font-bold">{val}</span>
            </div>
          ))}

          <button
            onClick={handleStart}
            className="mt-7 py-3.5 rounded-md text-white font-bold text-[14px] tracking-[0.2em] cursor-pointer border-none transition-all duration-150 hover:-translate-y-0.5"
            style={{
              background: selectedTrack.accent,
              boxShadow: `0 0 24px ${selectedTrack.accent}50`,
            }}
            onMouseEnter={(e) => {
              e.target.style.boxShadow = `0 4px 32px ${selectedTrack.accent}70`
            }}
            onMouseLeave={(e) => {
              e.target.style.boxShadow = `0 0 24px ${selectedTrack.accent}50`
            }}
          >
            START RACE →
          </button>
        </div>
      </div>
    </div>
  )
}