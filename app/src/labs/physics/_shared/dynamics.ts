/** Forces and Newton's laws: small, pure helpers shared by the Grade 9 dynamics labs. */

export const G_EARTH = 9.8
export const G_CONST = 6.67e-11
export const EARTH_RADIUS_KM = 6371

/** Resultant of forces along a line (right/up positive). */
export const resultant = (forces: number[]) => forces.reduce((s, f) => s + f, 0) + 0

/**
 * Pushing an object on a rough floor: static friction matches the push up to its limit,
 * then kinetic friction opposes the motion. Returns the friction force and the net force.
 */
export function withFriction(push: number, maxStatic: number, kinetic: number, moving: boolean) {
  if (!moving && Math.abs(push) <= maxStatic) return { friction: -push + 0, net: 0, moves: false }
  const dir = Math.sign(push) || 1
  const friction = -dir * kinetic
  return { friction: friction + 0, net: push + friction + 0, moves: true }
}

/** Newton's second law: a = F ÷ m. */
export const accel = (force: number, mass: number) => force / mass
export const weight = (mass: number, g = G_EARTH) => mass * g

export const momentum = (m: number, v: number) => m * v + 0
export const kineticEnergy = (m: number, v: number) => 0.5 * m * v * v

/**
 * One-dimensional collision with coefficient of restitution e
 * (e = 1 perfectly bouncy, e = 0 the carts stick together). Momentum is always conserved.
 */
export function collide(m1: number, u1: number, m2: number, u2: number, e: number) {
  const p = m1 * u1 + m2 * u2
  const v1 = (p + m2 * e * (u2 - u1)) / (m1 + m2)
  const v2 = (p + m1 * e * (u1 - u2)) / (m1 + m2)
  return { v1: v1 + 0, v2: v2 + 0 }
}

/** Two skaters push apart from rest with force F for time t: equal and opposite impulses. */
export function pushApart(m1: number, m2: number, force: number, t: number) {
  const impulse = force * t
  return { v1: -impulse / m1 + 0, v2: impulse / m2, a1: -force / m1 + 0, a2: force / m2 }
}

/** Average force needed to stop momentum p in time t (impulse = change in momentum). */
export const stoppingForce = (m: number, v: number, t: number) => (m * v) / t

/** Newton's law of gravitation: F = G m₁ m₂ ÷ r². */
export const gravity = (m1: number, m2: number, r: number) => (G_CONST * m1 * m2) / (r * r)

/** g at height h (km) above Earth's surface: falls off with the inverse square of distance from the centre. */
export const gAtHeight = (hKm: number, g0 = G_EARTH) => g0 * (EARTH_RADIUS_KM / (EARTH_RADIUS_KM + hKm)) ** 2
