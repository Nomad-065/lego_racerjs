/**
 * AICar.jsx
 *
 * Simple but effective AI:
 * - Follows the CatmullRomCurve3 track spline
 * - Steers toward the next waypoint using torque
 * - Rubber-bands speed based on distance to player
 * - Reads player telemetry from raceManager (no React state)
 * - Writes its own telemetry to raceManager every frame
 */

import {useRef, useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {RigidBody} from '@react-three/rapier'
import * as THREE from 'three'
import {registerCar, unregisterCar, carBodies, writeTelemetry, readTelemetry} from '../systems/raceManager'
import {trackCurve, GRID_POSITIONS, getStartRotation} from '../utils/trackData'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore'

// Per-AI config — different personalities
const AI_PROFILES = [
  {baseSpeed: 20, agression: 0.9, lookahead: 0.04},
  {baseSpeed: 22, agression: 1.0, lookahead: 0.035},
  {baseSpeed: 19, agression: 0.85, lookahead: 0.045},
  {baseSpeed: 23, agression: 1.1, lookahead: 0.03},
  {baseSpeed: 21, agression: 0.95, lookahead: 0.038},
]

const STEER_TORQUE = 0.5
const LINEAR_DAMPING = 0.75
const ANGULAR_DAMPING = 5

// Find the closest t on the curve to a given world position
function closestT(pos, samples = 60) {
  let best = 0, bestDist = Infinity
  for (let i = 0; i < samples; i++) {
    const t = i / samples
    const pt = trackCurve.getPointAt(t)
    const d = pt.distanceToSquared(pos)
    if (d < bestDist) {
      bestDist = d;
      best = t
    }
  }
  return best
}

export function AICar({carId, colorHex = '#4cc9f0'}) {
  const bodyRef = useRef()
  const tRef = useRef(0)          // current t on curve (0–1)
  const profile = AI_PROFILES[(carId - 1) % AI_PROFILES.length]
  const phase = useGameStore((s) => s.screen)
  const startPos = GRID_POSITIONS[carId]
  const startAngle = getStartRotation()

  useEffect(() => {
    registerCar(carId, false)
    return () => unregisterCar(carId)
  }, [carId])

  useEffect(() => {
    if (bodyRef.current) carBodies.set(carId, bodyRef.current)
  })

  useFrame((_, delta) => {
    const body = bodyRef.current
    if (!body) return

    writeTelemetry(carId, body)

    if (phase !== APP_SCREENS.RACING) return

    const pos = body.translation()
    const vel = body.linvel()
    const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)

    // Update track position
    tRef.current = closestT(new THREE.Vector3(pos.x, 0, pos.z))

    // Target point ahead on the curve
    const targetT = (tRef.current + profile.lookahead) % 1
    const targetPt = trackCurve.getPointAt(targetT)
    const targetDir = new THREE.Vector3(targetPt.x - pos.x, 0, targetPt.z - pos.z).normalize()

    // Car's current forward direction
    const rot = body.rotation()
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(quat)

    // Cross product Z gives signed angle error
    const cross = fwd.x * targetDir.z - fwd.z * targetDir.x
    body.applyTorqueImpulse({x: 0, y: -cross * STEER_TORQUE * profile.agression, z: 0}, true)

    // Rubber-band speed vs player
    const playerData = readTelemetry(0)
    const playerSpeed = playerData?.speed ?? profile.baseSpeed
    const rubberBand = 1 + (playerSpeed - speed) * 0.03
    const targetSpeed = profile.baseSpeed * Math.max(0.7, Math.min(1.3, rubberBand))

    if (speed < targetSpeed) {
      body.applyImpulse({x: fwd.x * 15 * delta * 60, y: 0, z: fwd.z * 15 * delta * 60}, true)
    }
  })

  return (
    <RigidBody
      ref={bodyRef}
      colliders="cuboid"
      mass={1}
      linearDamping={LINEAR_DAMPING}
      angularDamping={ANGULAR_DAMPING}
      position={[startPos.x, startPos.y, startPos.z]}
      rotation={[0, startAngle, 0]}
      enabledRotations={[false, true, false]}
      name={`ai-${carId}`}
    >
      {/* Car body */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.55, 3.8]}/>
        <meshStandardMaterial color={colorHex} metalness={0.3} roughness={0.5}/>
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.5, -0.1]} castShadow>
        <boxGeometry args={[1.3, 0.45, 2.0]}/>
        <meshStandardMaterial color={colorHex} metalness={0.1} roughness={0.7}/>
      </mesh>
      {/* Wheels */}
      {[[-0.95, -0.25, 1.3], [0.95, -0.25, 1.3], [-0.95, -0.25, -1.3], [0.95, -0.25, -1.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 12]}/>
          <meshStandardMaterial color="#111" roughness={1}/>
        </mesh>
      ))}
    </RigidBody>
  )
}