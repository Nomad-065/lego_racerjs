/**
 * SettingsScreen.jsx — Tailwind v4
 */

import { useState } from 'react'
import { useGameStore, APP_SCREENS } from '../stores/useGameStore'

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-mono text-[11px] tracking-[0.15em] text-text-muted border border-border rounded px-3.5 py-1.5 bg-transparent cursor-pointer hover:text-white hover:border-white/30 transition-colors outline-none"
    >
      ← BACK
    </button>
  )
}

function Slider({ label, value, onChange, min = 0, max = 100 }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-[11px] tracking-[0.15em] text-text-muted font-mono">{label}</span>
        <span className="text-[11px] text-white font-mono font-bold">{value}</span>
      </div>
      <div className="relative h-1 bg-white/[0.08] rounded-sm">
        <div
          className="absolute left-0 top-0 bottom-0 rounded-sm"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #e63946, #ff006e)' }}
        />
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute opacity-0 cursor-pointer w-full"
          style={{ inset: '-8px 0' }}
        />
      </div>
    </div>
  )
}

function Toggle({ label, sub, value, onChange }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-white/[0.05]">
      <div>
        <div className="text-[12px] font-mono tracking-wide text-white/80">{label}</div>
        {sub && <div className="text-[10px] font-mono text-text-muted mt-0.5">{sub}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full border-none cursor-pointer flex-shrink-0 transition-all duration-200"
        style={{
          background: value ? '#e63946' : 'rgba(255,255,255,0.1)',
          boxShadow: value ? '0 0 12px rgba(230,57,70,0.4)' : 'none',
        }}
      >
        <div
          className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200"
          style={{ left: value ? '23px' : '3px' }}
        />
      </button>
    </div>
  )
}

function KeyBind({ action, keys }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
      <span className="text-[11px] tracking-[0.15em] text-text-muted font-mono">{action}</span>
      <div className="flex gap-1.5">
        {keys.map((k) => (
          <kbd key={k} className="px-2.5 py-0.5 bg-white/[0.07] border border-white/[0.15] rounded text-[11px] text-white font-mono">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  )
}

const TABS = ['AUDIO', 'GRAPHICS', 'CONTROLS']

function AudioTab({ settings, update }) {
  return (
    <div>
      <Slider label="MASTER VOLUME" value={settings.masterVolume} onChange={(v) => update('masterVolume', v)} />
      <Slider label="SFX VOLUME"    value={settings.sfxVolume}    onChange={(v) => update('sfxVolume', v)} />
      <Slider label="MUSIC VOLUME"  value={settings.musicVolume}  onChange={(v) => update('musicVolume', v)} />
    </div>
  )
}

function GraphicsTab({ settings, update }) {
  return (
    <div>
      <Toggle label="SHADOWS"       sub="Dynamic shadow casting"        value={settings.shadows}   onChange={(v) => update('shadows', v)} />
      <Toggle label="ANTI-ALIASING" sub="Smooth edges, slight perf cost" value={settings.antialias} onChange={(v) => update('antialias', v)} />
      <Toggle label="SHOW FPS"      sub="Performance overlay"           value={settings.showFps}   onChange={(v) => update('showFps', v)} />
    </div>
  )
}

function ControlsTab({ settings, update }) {
  const bindings = [
    ['ACCELERATE',  ['W', '↑']],
    ['REVERSE',     ['S', '↓']],
    ['STEER LEFT',  ['A', '←']],
    ['STEER RIGHT', ['D', '→']],
    ['BRAKE',       ['SPACE']],
    ['BOOST',       ['SHIFT']],
  ]
  return (
    <div>
      <Toggle label="INVERT STEERING" sub="Swap left / right steer keys" value={settings.invertSteer} onChange={(v) => update('invertSteer', v)} />
      <div className="h-4" />
      <div className="text-[10px] tracking-[0.25em] text-white/25 mb-3 font-mono">KEY BINDINGS (read-only)</div>
      {bindings.map(([a, k]) => <KeyBind key={a} action={a} keys={k} />)}
    </div>
  )
}

export function SettingsScreen() {
  const screen        = useGameStore((s) => s.screen)
  const setScreen     = useGameStore((s) => s.setScreen)
  const settings      = useGameStore((s) => s.settings)
  const updateSetting = useGameStore((s) => s.updateSetting)
  const [activeTab, setActiveTab] = useState(0)

  if (screen !== APP_SCREENS.SETTINGS) return null

  return (
    <div className="fixed inset-0 z-50 bg-cockpit flex flex-col overflow-hidden"
      style={{ padding: 'clamp(24px, 4vh, 48px) clamp(24px, 5vw, 80px)' }}>

      {/* Header */}
      <div className="flex items-center gap-5 mb-10 pb-5 border-b border-white/[0.06]">
        <BackButton onClick={() => setScreen(APP_SCREENS.MAIN_MENU)} />
        <div>
          <div className="text-xl font-black font-mono text-white tracking-[-1px]">SETTINGS</div>
          <div className="text-[10px] tracking-[0.25em] text-text-muted font-mono">SYSTEM CONFIGURATION</div>
        </div>
      </div>

      <div className="grid gap-10 flex-1" style={{ gridTemplateColumns: '200px 1fr' }}>
        {/* Tab sidebar */}
        <div>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className="block w-full text-left bg-transparent border-none cursor-pointer py-3 font-mono text-[13px] tracking-[0.15em] outline-none transition-all duration-150 pl-4"
              style={{
                fontWeight:  activeTab === i ? 700 : 400,
                color:       activeTab === i ? 'white' : 'rgba(255,255,255,0.35)',
                borderLeft: `2px solid ${activeTab === i ? '#e63946' : 'transparent'}`,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="max-w-sm">
          {activeTab === 0 && <AudioTab    settings={settings} update={updateSetting} />}
          {activeTab === 1 && <GraphicsTab settings={settings} update={updateSetting} />}
          {activeTab === 2 && <ControlsTab settings={settings} update={updateSetting} />}
        </div>
      </div>
    </div>
  )
}
