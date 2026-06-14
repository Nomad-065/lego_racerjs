/**
 * IntroScreen.jsx — Tailwind v4
 * Drop /public/intro.mp4 to use a real video. Falls back to canvas animation.
 */

import {useEffect, useRef, useState} from 'react'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore.js'
import {useNavigate} from "react-router-dom";

export function IntroScreen() {
  const navigate = useNavigate()

  const screen = useGameStore((s) => s.screen)
  const setScreen = useGameStore((s) => s.setScreen)
  const [visible, setVisible] = useState(true)

  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const videoRef = useRef(null)


  const VIDEOS = [
    '/assets/videos/lego_intro.webm',
    '/assets/videos/high_voltage_intro.webm',
    '/assets/videos/game_intro.webm',
  ]

  // const next = () => {
  //   if (currentIndex < VIDEOS.length - 1) {
  //     setCurrentIndex(i => i + 1)
  //     // give React a tick to update src, then play
  //     setTimeout(() => {
  //       videoRef.current?.load()
  //       videoRef.current?.play()
  //     }, 0)
  //   } else {
  //     finish()
  //   }
  // }

  const next = () => {
    if (currentIndex < VIDEOS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    setVisible(false)
    // setStarted(false)
    setTimeout(() => setScreen(APP_SCREENS.MAIN_MENU), 400)
    navigate("/main")
  }

  const handleStart = async () => {
    setStarted(true)
    // const video = videoRef?.current
    // console.log('before:', video.muted, video.paused)
    // video.muted = false
    // await video.play()
    // console.log('after:', video.muted, video.paused)
  }
  useEffect(() => {
    if (!started) return;

    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(console.error);
  }, [started, currentIndex]);

  // if (screen !== APP_SCREENS.INTRO) return null

  return (
    <div
      className="flex flex-1 h-full overflow-hidden cursor-pointer"
      style={{opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease'}}
    >
      {started && (
        <video
          ref={videoRef}
          // src="/assets/video/LEGO_Racers_Intro.webm"
          src={VIDEOS[currentIndex]}
          className=" w-full h-full object-cover"
          playsInline
          onEnded={finish}
          onError={finish}

        />
      )}
      {/* Click to start overlay */}
      {!started && (
        <div
          className="h-full w-full flex items-center justify-center bg-black cursor-pointer"
          onClick={handleStart}
        >
          <p className="font-racers text-white text-3xl tracking-[0.3em] animate-pulse">
            CLICK TO START
          </p>
        </div>
      )}

      {/* Skip hint */}
      {started && (
        <>
          <div className="absolute inset-0 cursor-pointer" onClick={next}/>
          <div
            className="absolute bottom-7 right-8 text-md tracking-[0.2em] text-white animate-fadein pointer-events-none"
            style={{animationDelay: '1.5s'}}
          >
            CLICK TO SKIP
          </div>
        </>
      )}
    </div>
  )
}
