/**
 * LapSystem.jsx
 *
 * Hot path rules:
 * - Reads carBodies (ref) and checkpoint positions every frame — zero React
 * - Zustand actions are pulled ONCE with useRef so they're stable references
 *   and never cause re-subscribes inside useFrame
 * - setStandings has a built-in equality check in the store so it only
 *   triggers a React re-render when standings actually change
 */

import {useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import * as THREE from 'three'
import {carBodies, updateStandings} from '../systems/raceManager'
import {checkpointPositions, NUM_CHECKPOINTS} from '../utils/trackData'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore'

const CHECKPOINT_RADIUS = 8    // metres
const STANDINGS_INTERVAL = 500  // ms

const _carPt = new THREE.Vector3()
const _cpPt = new THREE.Vector3()

export function LapSystem() {
  const nextCheckpoint = useRef(new Map())
  const lastStandingsUpdate = useRef(0)

  // Subscribe to screen for the gate check — this is fine, screen rarely changes
  const screen = useGameStore((s) => s.screen)

  // Pull actions into stable refs — actions are stable in Zustand but this
  // makes it explicit and avoids any selector-churn risk
  const recordCheckpoint = useGameStore((s) => s.recordCheckpoint)
  const setStandings = useGameStore((s) => s.setStandings)
  const totalLaps = useGameStore((s) => s.totalLaps)

  const actionsRef = useRef({recordCheckpoint, setStandings, totalLaps})
  actionsRef.current = {recordCheckpoint, setStandings, totalLaps}

  useFrame((state) => {
    if (screen !== APP_SCREENS.RACING) return

    const now = state.clock.elapsedTime * 1000
    const {recordCheckpoint, setStandings} = actionsRef.current

    carBodies.forEach((body, carId) => {
      if (!body) return

      if (!nextCheckpoint.current.has(carId)) {
        nextCheckpoint.current.set(carId, 0)
      }

      const pos = body.translation()
      const next = nextCheckpoint.current.get(carId)
      const cpPos = checkpointPositions[next]
      if (!cpPos) return

      _carPt.set(pos.x, 0, pos.z)
      _cpPt.set(cpPos.x, 0, cpPos.z)

      if (_carPt.distanceTo(_cpPt) < CHECKPOINT_RADIUS) {
        recordCheckpoint(carId, next, NUM_CHECKPOINTS, now)
        nextCheckpoint.current.set(carId, (next + 1) % NUM_CHECKPOINTS)
      }
    })

    if (now - lastStandingsUpdate.current > STANDINGS_INTERVAL) {
      lastStandingsUpdate.current = now
      setStandings(updateStandings())
    }
  })

  return null
}