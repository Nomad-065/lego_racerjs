import {Outlet} from "react-router-dom";
import {useEffect, useRef} from "react";
import {useGameStore} from "../stores/useGameStore.js";

const Layout = () => {
  const musicVolume = useGameStore((s) => s.settings.musicVolume);
  const audioRef = useRef(null);

  useEffect(() => {

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

  return (
    <div
      className="h-screen w-full flex flex-col"
      style={{
        backgroundImage: "url('/assets/images/lego_racers_bg.webp')",
      }}
    >
      <main className="flex-1 flex flex-col w-full min-h-0 overflow-hidden">
        <Outlet/>
      </main>
    </div>
  );
};

export default Layout;
