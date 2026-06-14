/**
 * FollowCamera.jsx
 *
 * Reads player position directly from raceManager (via carBodies ref)
 * every frame — zero React state, zero re-renders.
 *
 * Uses lerp for smooth follow and look-at for natural orientation.
 */

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { carBodies } from '../systems/raceManager'

const CAMERA_OFFSET   = new THREE.Vector3(0, 4.5, 11)
const LERP_SPEED      = 0.08
const LOOKAHEAD_DIST  = 6   // look ahead of the car, not at it

const _desiredPos  = new THREE.Vector3()
const _currentPos  = new THREE.Vector3()
const _lookTarget  = new THREE.Vector3()
const _offset      = new THREE.Vector3()
const _fwd         = new THREE.Vector3()

export function FollowCamera() {
  const { camera } = useThree()
  const initialized = useRef(false)

  useFrame(() => {
    const body = carBodies.get(0)   // player is ID 0
    if (!body) return

    const pos  = body.translation()
    const rot  = body.rotation()
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w)

    // Offset behind the car in world space
    _offset.copy(CAMERA_OFFSET).applyQuaternion(quat)
    _desiredPos.set(pos.x + _offset.x, pos.y + _offset.y, pos.z + _offset.z)

    // Snap on first frame, lerp after
    if (!initialized.current) {
      camera.position.copy(_desiredPos)
      initialized.current = true
    } else {
      _currentPos.copy(camera.position)
      camera.position.lerp(_desiredPos, LERP_SPEED)
    }

    // Look slightly ahead of the car
    _fwd.set(0, 0, -LOOKAHEAD_DIST).applyQuaternion(quat)
    _lookTarget.set(pos.x + _fwd.x, pos.y + 1, pos.z + _fwd.z)
    camera.lookAt(_lookTarget)
  })

  return null
}
