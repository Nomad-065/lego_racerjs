/**
 * MainMenu.jsx — Tailwind v4
 */

import {useState, useEffect, useRef, useMemo} from 'react'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore.js'
import {useNavigate} from "react-router-dom";


function MenuItem({label, sub, onClick, delay = 0, disabled = false}) {
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
        opacity: mounted ? (disabled ? 0.3 : 1) : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-40px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        cursor: disabled ? 'default' : 'pointer',
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
        className=" font-black leading-none tracking-tight"
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
        <div className="text-[11px] tracking-[0.2em] mt-0.5 text-text-muted">
          {sub}
        </div>
      )}
    </button>
  )
}

export function MainMenu() {
  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const musicVolume = useGameStore((s) => s.settings.musicVolume);
  const navigate = useNavigate()
  const audioRef = useRef(null);

  useEffect(() => {
    // if (
    //   screen !== APP_SCREENS.MAIN_MENU
    //   // && screen !== APP_SCREENS.RACE_SELECT
    // ) {
    //   return;
    // }

    const audio = new Audio("/assets/audios/menu_theme.m4a");
    audio.loop = true;
    audio.volume = musicVolume;

    audio.play().catch((err) => {
      console.log("Audio blocked until user interaction:", err);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  // if (screen !== APP_SCREENS.MAIN_MENU) return null
  const menuItems = useMemo(
    () => [
      {label: 'BUILD', route: '/settings', spacerAfter: true},
      {label: 'CIRCUIT RACE', route: '/settings'},
      {label: 'SINGLE RACE', route: '/settings'},
      {label: 'VERSUS RACE', route: '/settings'},
      {label: 'TIME RACE', route: '/settings', spacerAfter: true},
      {label: 'OPTIONS', route: '/settings', spacerAfter: true},
      {
        label: 'QUIT',
        // action: () => window.close()
        action: () => alert('Please close the tab to quit.')
      },
    ],
    []
  )

  return (
    <div className="flex flex-1 h-full w-full">

      {/* Left content */}
      <div className="w-1/2 flex flex-col h-full p-10">
        <img
          className={'h-30 pl-10 w-fit object-left object-contain bg-no-repeat'}
          src={"/assets/images/lego_racers_logo.webp"}
          alt={'logo'}
        />

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
        {/* Nav */}
        {/*<div className="pl-6">*/}
        {/*  <MenuItem label="RACE" sub="SELECT TRACK & START" delay={400}*/}
        {/*            onClick={() => setScreen(APP_SCREENS.RACE_SELECT)}/>*/}
        {/*  <MenuItem label="SETTINGS" sub="AUDIO, GRAPHICS, CONTROLS" delay={520}*/}
        {/*            onClick={() => setScreen(APP_SCREENS.SETTINGS)}/>*/}
        {/*  <MenuItem label="GARAGE" sub="COMING SOON" delay={640} disabled/>*/}
        {/*  <MenuItem label="QUIT" sub="CLOSE GAME" delay={760} onClick={() => window.close()}/>*/}
        {/*</div>*/}
      </div>

      {/* Build info */}
      <div className="absolute bottom-6 left-12 text-md tracking-[0.2em] text-white/50 ">
        LEGO RacerJS v0.1.0 · BUILD 2026
      </div>
    </div>
  )
}
