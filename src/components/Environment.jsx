/**
 * Environment.jsx — Lighting, sky, fog
 */

import { Sky, Stars } from '@react-three/drei'
import { useGameStore, APP_SCREENS } from '../stores/useGameStore'

export function Environment() {
  return (
    <>
      <ambientLight intensity={0.35} />

      {/* Key light — sun */}
      <directionalLight
        position={[40, 60, 20]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        color="#fff4e0"
      />

      {/* Fill light */}
      <directionalLight position={[-20, 20, -20]} intensity={0.3} color="#a8dadc" />

      {/* Ground bounce */}
      <hemisphereLight skyColor="#87ceeb" groundColor="#2d4739" intensity={0.4} />

      <Sky
        sunPosition={[100, 25, 100]}
        turbidity={8}
        rayleigh={2}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <Stars radius={150} depth={60} count={2000} factor={4} fade />

      <fog attach="fog" color="#1a2a1a" near={80} far={200} />
    </>
  )
}
