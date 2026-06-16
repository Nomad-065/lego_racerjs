/**
 * SettingsScreen.jsx — Tailwind v4
 */

import {useMemo, useState} from 'react'
import {useGameStore, APP_SCREENS} from '../../stores/useGameStore.js'
import {useNavigate} from "react-router-dom";

function BackButton({onClick}) {
  return (
    <button
      onClick={onClick}
      className=" text-[11px] tracking-[0.15em] text-text-muted border border-border rounded px-3.5 py-1.5 bg-transparent cursor-pointer hover:text-white hover:border-white/30 transition-colors outline-none"
    >
      ← BACK
    </button>
  )
}

function Slider({label, value, onChange, min = 0, max = 1}) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayValue = value * 100
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm tracking-[0.15em] text-text-muted">
          {label}
        </span>

        <span className="text-sm text-white font-bold">
          {displayValue.toFixed(0)}
        </span>
      </div>

      <div className="relative h-1 bg-white/10 rounded-sm">
        <div
          className="absolute left-0 top-0 bottom-0 rounded-sm"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #e63946, #ff006e)",
          }}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute opacity-0 cursor-pointer w-full"
          style={{inset: "-8px 0"}}
        />
      </div>
    </div>
  );
}

function Toggle({label, sub, value, onChange}) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-white/[0.05]">
      <div>
        <div className="text-[12px]  tracking-wide text-white/80">{label}</div>
        {sub && <div className="text-[10px]  text-text-muted mt-0.5">{sub}</div>}
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
          style={{left: value ? '23px' : '3px'}}
        />
      </button>
    </div>
  )
}

function KeyBind({action, keys}) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-white/[0.05]">
      <span className="text-[11px] tracking-[0.15em] text-text-muted ">{action}</span>
      <div className="flex gap-1.5">
        {keys.map((k) => (
          <kbd key={k}
               className="px-2.5 py-0.5 bg-white/[0.07] border border-white/[0.15] rounded text-[11px] text-white ">
            {k}
          </kbd>
        ))}
      </div>
    </div>
  )
}

const TABS = ['AUDIO', 'GRAPHICS', 'CONTROLS']

function AudioTab({settings, update}) {
  return (
    <div>
      <Slider label="MASTER VOLUME" value={settings.masterVolume} onChange={(v) => update('masterVolume', v)}/>
      <Slider label="SFX VOLUME" value={settings.sfxVolume} onChange={(v) => update('sfxVolume', v)}/>
      <Slider label="MUSIC VOLUME" value={settings.musicVolume} onChange={(v) => update('musicVolume', v)}/>
    </div>
  )
}

function GraphicsTab({settings, update}) {
  return (
    <div>
      <Toggle label="SHADOWS" sub="Dynamic shadow casting" value={settings.shadows}
              onChange={(v) => update('shadows', v)}/>
      <Toggle label="ANTI-ALIASING" sub="Smooth edges, slight perf cost" value={settings.antialias}
              onChange={(v) => update('antialias', v)}/>
      <Toggle label="SHOW FPS" sub="Performance overlay" value={settings.showFps}
              onChange={(v) => update('showFps', v)}/>
    </div>
  )
}

function ControlsTab({settings, update}) {
  const bindings = [
    ['ACCELERATE', ['W', '↑']],
    ['REVERSE', ['S', '↓']],
    ['STEER LEFT', ['A', '←']],
    ['STEER RIGHT', ['D', '→']],
    ['BRAKE', ['SPACE']],
    ['BOOST', ['SHIFT']],
  ]
  return (
    <div>
      <Toggle label="INVERT STEERING" sub="Swap left / right steer keys" value={settings.invertSteer}
              onChange={(v) => update('invertSteer', v)}/>
      <div className="h-4"/>
      <div className="text-[10px] tracking-[0.25em] text-white/25 mb-3 ">KEY BINDINGS (read-only)</div>
      {bindings.map(([a, k]) => <KeyBind key={a} action={a} keys={k}/>)}
    </div>
  )
}

export function OptionsScreen() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const settings = useGameStore((s) => s.settings)
  const updateSetting = useGameStore((s) => s.updateSetting)
  const navigate = useNavigate()


  const menuItems = useMemo(
    () => [
      {label: 'GAME OPTIONS', route: '/settings'},
      {label: 'AUDIO OPTIONS', route: '/settings'},
      {label: 'PLAYER CONTROLS', route: '/settings'},
      {label: 'PICK LANGUAGE', route: '/settings'},
      {label: 'VIEW CREDITS', route: '/settings', spacerAfter: true},
      {
        label: 'MAIN MENU',
        // action: () => window.close()
        route: '/main'
      },
    ],
    []
  )


  return (
    <div className="flex flex-1 h-full w-full">

      {/* Left content */}
      <div className="w-1/2 flex flex-col h-full p-10">


        <div
          className={'flex-1 flex flex-col p-6 items-start justify-center text-yellow-400/50 text-outline-black-100 text-[40px] overflow-auto'}>
          {menuItems.map((item) => (
            <span
              key={item.label}
              className={`hover:text-yellow-400 cursor-pointer ${
                item.spacerAfter ? 'mb-10' : ''
              }`}
              onClick={() => {
                if (item.action) {
                  item.action()
                } else {
                  navigate(item.route)
                }
              }}
            >
              {item.label}
            </span>
          ))}
        </div>

      </div>
      <div className="w-1/2 flex flex-col h-full p-10">
        <span className={'text-white text-[58px] text-right'}>OPTIONS</span>
      </div>

      {/* Build info */}
      <div className="absolute bottom-6 left-12 text-md tracking-[0.2em] text-white/50 ">
        LEGO RacerJS v0.1.0 · BUILD 2026
      </div>
    </div>
  )
}
