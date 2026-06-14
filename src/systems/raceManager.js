/**
 * RaceManager — the single source of truth for all per-frame car data.
 *
 * Design philosophy:
 * - All high-frequency data (position, velocity, speed, gear) lives in plain refs/Maps.
 * - Zero React state in the hot path → zero re-renders per frame.
 * - Zustand is only used for low-frequency game-level events (lap completed, race phase,
 *   standings) that React components legitimately need to subscribe to.
 * - Systems (camera, AI, HUD) read from raceManager directly inside useFrame().
 */

export const MAX_CARS = 6

// ─── Per-car telemetry (written every frame by each car's useFrame) ───────────
// Map<carId, CarTelemetry>
// CarTelemetry: { pos, rot, linvel, speed, gear, rpm, lap, checkpoint, isPlayer }
export const carTelemetry = new Map()

// ─── Rigid body refs (set once on mount by each car) ──────────────────────────
// Map<carId, RapierRigidBody>
export const carBodies = new Map()

// ─── Initialise a car slot ────────────────────────────────────────────────────
export function registerCar(id, isPlayer = false) {
  carTelemetry.set(id, {
    pos:        { x: 0, y: 0, z: 0 },
    rot:        { x: 0, y: 0, z: 0, w: 1 },
    linvel:     { x: 0, y: 0, z: 0 },
    speed:      0,       // m/s
    gear:       1,
    rpm:        0,
    lap:        0,
    checkpoint: 0,
    isPlayer,
    finished:   false,
    racePos:    id + 1,  // starting grid position
  })
}

export function unregisterCar(id) {
  carTelemetry.delete(id)
  carBodies.delete(id)
}

// ─── Write telemetry (called inside each car's useFrame) ─────────────────────
export function writeTelemetry(id, body) {
  const entry = carTelemetry.get(id)
  if (!entry || !body) return

  const pos    = body.translation()
  const rot    = body.rotation()
  const linvel = body.linvel()
  const speed  = Math.sqrt(linvel.x ** 2 + linvel.z ** 2) // m/s

  // Simple gear simulation based on speed bands
  const gear = speed < 3 ? 1 : speed < 8 ? 2 : speed < 14 ? 3 : speed < 20 ? 4 : speed < 26 ? 5 : 6
  const rpm  = 1000 + ((speed % (gear * 4.5)) / (gear * 4.5)) * 6000

  entry.pos    = pos
  entry.rot    = rot
  entry.linvel = linvel
  entry.speed  = speed
  entry.gear   = gear
  entry.rpm    = Math.min(rpm, 7000)
}

// ─── Read telemetry (called by camera, HUD, AI) ───────────────────────────────
export function readTelemetry(id) {
  return carTelemetry.get(id) ?? null
}

export function readAllTelemetry() {
  return carTelemetry
}

// ─── Update race standings (called by lap system, infrequently) ───────────────
export function updateStandings() {
  const entries = [...carTelemetry.entries()]
    .sort(([, a], [, b]) => {
      if (b.lap !== a.lap) return b.lap - a.lap
      return b.checkpoint - a.checkpoint
    })

  entries.forEach(([id], i) => {
    const entry = carTelemetry.get(id)
    if (entry) entry.racePos = i + 1
  })

  return entries.map(([id, t]) => ({ id, lap: t.lap, racePos: t.racePos, isPlayer: t.isPlayer }))
}
