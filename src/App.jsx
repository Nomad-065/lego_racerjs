/**
 * App.jsx — Root component & screen router
 *
 * Screen flow:
 *   INTRO → MAIN_MENU → RACE_SELECT → COUNTDOWN → RACING → FINISHED
 *                     ↘ SETTINGS ↗
 *
 * The 3D Canvas is always mounted (so Rapier/Three don't re-init on race start).
 * Non-race screens are full-screen HTML overlays on top of it.
 * The Canvas renders a static "attract mode" scene when not racing.
 */

import {Canvas} from '@react-three/fiber'
import {Physics} from '@react-three/rapier'

import {Track} from './components/Track'
import {PlayerCar} from './components/PlayerCar'
import {AICar} from './components/AICar'
import {FollowCamera} from './components/FollowCamera'
import {Environment} from './components/Environment'
import {LapSystem} from './components/LapSystem'
import {HUD} from './components/HUD'

import {IntroScreen} from './pages/IntroScreen'
import {MainMenu} from './pages/MainMenu'
import {RaceSelectScreen} from './screens/RaceSelectScreen'
import {OptionsScreen} from './pages/options/OptionsScreen.jsx'

import {useGameStore, APP_SCREENS} from './stores/useGameStore'
import Layout from "./components/layout.jsx";
import {
  Route,
  Routes,
} from "react-router-dom";
import LoadingRoutes from "./routes/LoadingRoutes.jsx";
import MenuRoutes from "./routes/MenuRoutes.jsx";

const AI_COLORS = ['#4cc9f0', '#7209b7', '#f77f00', '#06d6a0', '#ffd60a']

// Screens where the 3D canvas should be visible
const CANVAS_SCREENS = new Set([
  APP_SCREENS.COUNTDOWN,
  APP_SCREENS.RACING,
  APP_SCREENS.FINISHED,
])

// Screens where physics cars should be active
const RACE_ACTIVE_SCREENS = new Set([
  APP_SCREENS.COUNTDOWN,
  APP_SCREENS.RACING,
  APP_SCREENS.FINISHED,
])

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const isRaceActive = RACE_ACTIVE_SCREENS.has(screen)
  const showCanvas = CANVAS_SCREENS.has(screen)

  return (
    <Routes>
      <Route element={<LoadingRoutes/>}>
        <Route path="/" element={<IntroScreen/>}/>
      </Route>

      <Route element={<MenuRoutes/>}>

        <Route path="/main" element={<MainMenu/>}/>
        <Route path="/race-select" element={<RaceSelectScreen/>}/>
        <Route path="/options" element={<OptionsScreen/>}/>
      </Route>
      {/*<div className="h-screen relative font-racers bg-black flex flex-col w-full p-10">*/}

      {/*  /!* ── 3D Canvas — always mounted, hidden during menus ─────────────────── *!/*/}
      {/*  /!*<div*!/*/}
      {/*  /!*  className="absolute inset-0 transition-opacity duration-600 ease-in-out"*!/*/}
      {/*  /!*  style={{*!/*/}
      {/*  /!*    opacity: showCanvas ? 1 : 0,*!/*/}
      {/*  /!*    pointerEvents: showCanvas ? 'auto' : 'none',*!/*/}
      {/*  /!*  }}*!/*/}
      {/*  /!*>*!/*/}
      {/*  /!*  <Canvas*!/*/}
      {/*  /!*    shadows*!/*/}
      {/*  /!*    camera={{fov: 60, near: 0.1, far: 300}}*!/*/}
      {/*  /!*    gl={{antialias: true}}*!/*/}
      {/*  /!*  >*!/*/}
      {/*  /!*    <Environment/>*!/*/}
      {/*  /!*    <Physics gravity={[0, -25, 0]} timeStep="vary" paused={!isRaceActive}>*!/*/}
      {/*  /!*      <Track/>*!/*/}
      {/*  /!*      <PlayerCar/>*!/*/}
      {/*  /!*      {AI_COLORS.map((color, i) => (*!/*/}
      {/*  /!*        <AICar key={i + 1} carId={i + 1} colorHex={color}/>*!/*/}
      {/*  /!*      ))}*!/*/}
      {/*  /!*      <LapSystem/>*!/*/}
      {/*  /!*    </Physics>*!/*/}
      {/*  /!*    <FollowCamera/>*!/*/}
      {/*  /!*  </Canvas>*!/*/}
      {/*  /!*</div>*!/*/}

      {/*  /!* ── In-game HUD (only during race) ──────────────────────────────────── *!/*/}
      {/*  /!*{showCanvas && <HUD/>}*!/*/}

      {/*  /!* ── Full-screen menu overlays ────────────────────────────────────────── *!/*/}
      {/*  /!*<IntroScreen/>*!/*/}
      {/*  /!*<MainMenu/>*!/*/}
      {/*  /!*<RaceSelectScreen/>*!/*/}
      {/*  /!*<SettingsScreen/>*!/*/}

      {/*</div>*/}
    </Routes>
  );
};