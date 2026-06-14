/**
 * trackData.js — shared track geometry used by:
 *   - Track.jsx       (renders the road mesh)
 *   - AIController    (follows waypoints)
 *   - LapSystem       (checkpoint triggers)
 *
 * The track is a simple oval for now. Replace WAYPOINTS with your
 * CatmullRomCurve3 points once you want a custom layout.
 */

import * as THREE from 'three'

// ─── Oval track waypoints (XZ plane, Y = 0) ───────────────────────────────────
export const WAYPOINTS = [
  [  0,  0,  -60 ],
  [ 25,  0,  -55 ],
  [ 50,  0,  -40 ],
  [ 60,  0,  -15 ],
  [ 60,  0,   15 ],
  [ 50,  0,   40 ],
  [ 25,  0,   55 ],
  [  0,  0,   60 ],
  [-25,  0,   55 ],
  [-50,  0,   40 ],
  [-60,  0,   15 ],
  [-60,  0,  -15 ],
  [-50,  0,  -40 ],
  [-25,  0,  -55 ],
].map(([x, y, z]) => new THREE.Vector3(x, y, z))

// Smooth spline through waypoints (closed loop)
export const trackCurve = new THREE.CatmullRomCurve3(WAYPOINTS, true, 'catmullrom', 0.5)

// Total arc length for AI speed regulation
export const TRACK_LENGTH = trackCurve.getLength()

// Checkpoint positions evenly spaced along the curve
export const NUM_CHECKPOINTS = 14
export const checkpointPositions = trackCurve.getSpacedPoints(NUM_CHECKPOINTS)

// Road width in world units
export const ROAD_WIDTH = 14

// Grid start positions (staggered 2-wide)
export const GRID_POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const t = new THREE.Vector3()
  trackCurve.getPointAt(0.02 * (Math.floor(i / 2) + 1), t)
  const offset = (i % 2 === 0 ? 1 : -1) * (ROAD_WIDTH * 0.25)
  return new THREE.Vector3(t.x + offset, 1, t.z)
})

// Starting orientation (pointing along the track)
export function getStartRotation() {
  const tangent = trackCurve.getTangentAt(0.02)
  return Math.atan2(tangent.x, tangent.z)
}
