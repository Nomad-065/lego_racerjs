/**
 * PlayerCar.jsx
 *
 * - Rapier RigidBody driven by impulses
 * - Reads input from useControls (ref-based, zero re-renders)
 * - Writes telemetry to raceManager every frame
 * - Does NOT read from or write to Zustand in the render loop
 */

import {useRef, useEffect} from 'react'
import {useFrame} from '@react-three/fiber'
import {RigidBody} from '@react-three/rapier'
import * as THREE from 'three'
import {useControls} from '../hooks/useControls'
import {registerCar, unregisterCar, carBodies, writeTelemetry} from '../systems/raceManager'
import {GRID_POSITIONS, getStartRotation} from '../utils/trackData'
import {useGameStore, APP_SCREENS} from '../stores/useGameStore'

// Physics constants — tune these for feel
const DRIVE_FORCE = 22
const REVERSE_FORCE = 10
const BRAKE_MULTIPLIER = 0.84
const STEER_TORQUE = 0.45
const MAX_SPEED = 28     // m/s ≈ 100 km/h
const LINEAR_DAMPING = 0.7
const ANGULAR_DAMPING = 5
const BOOST_MULTIPLIER = 1.5

const CAR_ID = 0  // player is always ID 0

const startPos = GRID_POSITIONS[0]
const startAngle = getStartRotation()

export function PlayerCar() {
  const bodyRef = useRef()
  const meshRef = useRef()
  const controls = useControls()
  const phase = useGameStore((s) => s.screen)

  useEffect(() => {
    registerCar(CAR_ID, true)
    return () => unregisterCar(CAR_ID)
  }, [])

  // Register the body ref once it mounts
  useEffect(() => {
    if (bodyRef.current) carBodies.set(CAR_ID, bodyRef.current)
  })

  useFrame(() => {
    const body = bodyRef.current
    if (!body) return

    // Write telemetry every frame — zero React overhead
    writeTelemetry(CAR_ID, body)

    // Don't apply forces unless racing
    if (phase !== APP_SCREENS.RACING) return

    const {forward, back, left, right, brake, boost} = controls.current
    const vel = body.linvel()
    const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2)

    // Car's forward direction from current quaternion
    const rot = body.rotation()
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat)

    const boostFactor = boost ? BOOST_MULTIPLIER : 1

    // Drive
    if (forward && speed < MAX_SPEED * boostFactor) {
      body.applyImpulse(
        {x: dir.x * DRIVE_FORCE * boostFactor, y: 0, z: dir.z * DRIVE_FORCE * boostFactor},
        true
      )
    }

    // Reverse
    if (back && speed < MAX_SPEED * 0.4) {
      body.applyImpulse(
        {x: -dir.x * REVERSE_FORCE, y: 0, z: -dir.z * REVERSE_FORCE},
        true
      )
    }

    // Brake (hard drag)
    if (brake) {
      body.setLinvel({x: vel.x * BRAKE_MULTIPLIER, y: vel.y, z: vel.z * BRAKE_MULTIPLIER}, true)
    }

    // Steering — scaled by speed so low-speed turns feel responsive
    if (speed > 0.3) {
      const steerDir = (left ? 1 : 0) - (right ? 1 : 0)
      const steerFactor = Math.min(speed / 10, 1)
      body.applyTorqueImpulse({x: 0, y: steerDir * STEER_TORQUE * steerFactor, z: 0}, true)
    }

    // Tilt mesh slightly into corners for visual feel
    if (meshRef.current) {
      const angVel = body.angvel()
      meshRef.current.rotation.z = THREE.MathUtils.lerp(
        meshRef.current.rotation.z,
        -angVel.y * 0.3,
        0.1
      )
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
      name="player"
    >
      <group ref={meshRef}>
        {/* Car body */}
        <mesh castShadow>
          <boxGeometry args={[1.8, 0.55, 3.8]}/>
          <meshStandardMaterial color="#e63946" metalness={0.3} roughness={0.5}/>
        </mesh>
        {/* Cabin */}
        <mesh position={[0, 0.5, -0.1]} castShadow>
          <boxGeometry args={[1.3, 0.45, 2.0]}/>
          <meshStandardMaterial color="#c1121f" metalness={0.2} roughness={0.6}/>
        </mesh>
        {/* Windshield tint */}
        <mesh position={[0, 0.6, 0.6]}>
          <boxGeometry args={[1.2, 0.3, 0.1]}/>
          <meshStandardMaterial color="#48cae4" transparent opacity={0.6}/>
        </mesh>
        {/* Wheels */}
        {[[-0.95, -0.25, 1.3], [0.95, -0.25, 1.3], [-0.95, -0.25, -1.3], [0.95, -0.25, -1.3]].map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 12]}/>
            <meshStandardMaterial color="#111" roughness={1}/>
          </mesh>
        ))}
      </group>
    </RigidBody>
  )
}