/**
 * Track.jsx
 *
 * - Renders the road tube extruded along the spline
 * - Static Rapier colliders for road surface + barriers
 * - Invisible checkpoint sensor triggers (Rapier sensors)
 */

import { useMemo } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import {
  trackCurve,
  ROAD_WIDTH,
  NUM_CHECKPOINTS,
  checkpointPositions,
} from '../utils/trackData'

// Build a flat ribbon mesh along the curve
function useTrackMesh() {
  return useMemo(() => {
    const points   = trackCurve.getSpacedPoints(200)
    const tangents = points.map((_, i) => trackCurve.getTangentAt(i / 200))

    const vertices = []
    const indices  = []
    const uvs      = []

    points.forEach((pt, i) => {
      const tan    = tangents[i]
      const right  = new THREE.Vector3(-tan.z, 0, tan.x).normalize()
      const left   = pt.clone().addScaledVector(right, -ROAD_WIDTH / 2)
      const rightP = pt.clone().addScaledVector(right,  ROAD_WIDTH / 2)

      vertices.push(left.x, 0.01, left.z)
      vertices.push(rightP.x, 0.01, rightP.z)

      const u = i / points.length
      uvs.push(0, u, 1, u)
    })

    for (let i = 0; i < points.length - 1; i++) {
      const a = i * 2, b = a + 1, c = a + 2, d = a + 3
      indices.push(a, b, c, b, d, c)
    }
    // close the loop
    const last = (points.length - 1) * 2
    indices.push(last, last + 1, 0, last + 1, 1, 0)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [])
}

// Barrier boxes along the inside/outside of the track
function Barriers() {
  const points  = trackCurve.getSpacedPoints(60)
  const tangents = points.map((_, i) => trackCurve.getTangentAt(i / 60))

  return points.map((pt, i) => {
    const tan   = tangents[i]
    const right = new THREE.Vector3(-tan.z, 0, tan.x).normalize()

    return [-1, 1].map((side) => {
      const pos = pt.clone().addScaledVector(right, side * (ROAD_WIDTH / 2 + 0.4))
      return (
        <RigidBody key={`${i}-${side}`} type="fixed" position={[pos.x, 0.5, pos.z]}>
          <CuboidCollider args={[0.4, 0.75, 2.5]} />
          <mesh castShadow>
            <boxGeometry args={[0.8, 1.5, 5]} />
            <meshStandardMaterial color={side === 1 ? '#c9184a' : '#1d3557'} />
          </mesh>
        </RigidBody>
      )
    })
  })
}

// Checkpoint sensor — invisible, used by LapSystem
function Checkpoints() {
  return checkpointPositions.map((pos, i) => (
    <RigidBody
      key={i}
      type="fixed"
      sensor
      position={[pos.x, 1, pos.z]}
      name={`checkpoint-${i}`}
    >
      <CuboidCollider args={[ROAD_WIDTH / 2, 2, 0.5]} sensor />
    </RigidBody>
  ))
}

export function Track() {
  const roadGeo = useTrackMesh()

  return (
    <>
      {/* Ground plane */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[300, 300]} />
          <meshStandardMaterial color="#2d4739" />
        </mesh>
      </RigidBody>

      {/* Road surface */}
      <RigidBody type="fixed">
        <mesh geometry={roadGeo} receiveShadow>
          <meshStandardMaterial color="#1a1a2e" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* Road markings (thinner strip on top) */}
      <mesh geometry={roadGeo} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#2c2c54" roughness={1} />
      </mesh>

      <Barriers />
      <Checkpoints />
    </>
  )
}
