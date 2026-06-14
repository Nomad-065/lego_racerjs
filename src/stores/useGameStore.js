import {create} from 'zustand'

export const APP_SCREENS = {
  INTRO: 'intro',
  MAIN_MENU: 'main-menu',
  RACE_SELECT: 'race-select',
  SETTINGS: 'settings',
  PRE_RACE: 'pre-race',
  COUNTDOWN: 'countdown',
  RACING: 'racing',
  FINISHED: 'finished',
}

// Kept for backward compat with any component still importing RACE_PHASES
export const RACE_PHASES = APP_SCREENS

const NUM_AI_CARS = 5

const defaultLapEntry = () => ({
  lapsComplete: 0, checkpointsPassed: 0, lapTimes: [], currentLapStart: 0,
})

// Store lap data as a plain object keyed by carId — NOT a Map.
// Maps inside Zustand state cause new-reference issues on every get().
const defaultLapData = () =>
  Object.fromEntries(
    Array.from({length: NUM_AI_CARS + 1}, (_, i) => [i, defaultLapEntry()])
  )

export const useGameStore = create((set, get) => ({
  // ── Navigation ──────────────────────────────────────────────────────────────
  screen: APP_SCREENS.INTRO,
  setScreen: (screen) => set({screen}),

  // ── Race config ─────────────────────────────────────────────────────────────
  totalLaps: 3,
  numAiCars: NUM_AI_CARS,
  selectedTrack: 0,
  difficulty: 'medium',

  setRaceConfig: ({totalLaps, selectedTrack, difficulty} = {}) => set((s) => ({
    totalLaps: totalLaps ?? s.totalLaps,
    selectedTrack: selectedTrack ?? s.selectedTrack,
    difficulty: difficulty ?? s.difficulty,
  })),

  // ── Settings ────────────────────────────────────────────────────────────────
  settings: {
    masterVolume: 80,
    sfxVolume: 100,
    musicVolume: 60,
    shadows: true,
    antialias: true,
    showFps: false,
    invertSteer: false,
  },
  updateSetting: (key, value) => set((s) => ({
    settings: {...s.settings, [key]: value},
  })),

  // ── Countdown ────────────────────────────────────────────────────────────────
  countdownValue: 3,

  startCountdown: () => {
    set({screen: APP_SCREENS.COUNTDOWN, countdownValue: 3})
    const interval = setInterval(() => {
      const val = get().countdownValue
      if (val <= 1) {
        clearInterval(interval)
        set({screen: APP_SCREENS.RACING, countdownValue: 0})
      } else {
        set({countdownValue: val - 1})
      }
    }, 1000)
  },

  // ── Lap tracking (plain object, not Map) ─────────────────────────────────────
  // Shape: { [carId]: { lapsComplete, checkpointsPassed, lapTimes, currentLapStart } }
  lapData: defaultLapData(),

  recordCheckpoint: (carId, checkpointIdx, totalCheckpoints, timestamp) => {
    set((state) => {
      const prev = state.lapData[carId] ?? defaultLapEntry()
      const car = {...prev, checkpointsPassed: checkpointIdx}

      if (checkpointIdx >= totalCheckpoints - 1) {
        car.lapsComplete = prev.lapsComplete + 1
        car.lapTimes = [...prev.lapTimes, timestamp - prev.currentLapStart]
        car.currentLapStart = timestamp
        car.checkpointsPassed = 0
      }

      const lapData = {...state.lapData, [carId]: car}

      // Check if player finished — set screen as side-effect via setTimeout
      // to avoid calling set() inside set()
      if (carId === 0 && car.lapsComplete >= state.totalLaps) {
        setTimeout(() => set({screen: APP_SCREENS.FINISHED}), 0)
      }

      return {lapData}
    })
  },

  // ── Standings ────────────────────────────────────────────────────────────────
  // Stored as a stable array; only replaced when content actually changes.
  standings: [],

  setStandings: (next) => {
    // Skip the set() if standings haven't changed — prevents 2fps re-renders
    const prev = get().standings
    if (
      prev.length === next.length &&
      prev.every((p, i) => p.id === next[i].id && p.racePos === next[i].racePos && p.lap === next[i].lap)
    ) return
    set({standings: next})
  },

  bestLap: null,
  setBestLap: (ms) => set((s) => ({
    bestLap: s.bestLap === null ? ms : Math.min(s.bestLap, ms),
  })),

  // ── Reset ────────────────────────────────────────────────────────────────────
  resetRace: () => set({
    screen: APP_SCREENS.RACE_SELECT, countdownValue: 3,
    standings: [], bestLap: null, lapData: defaultLapData(),
  }),

  goToMainMenu: () => set({
    screen: APP_SCREENS.MAIN_MENU, countdownValue: 3,
    standings: [], bestLap: null, lapData: defaultLapData(),
  }),
}))