import { withFriction } from '../_shared/dynamics'

export type Surface = { id: string; name: string; emoji: string; maxStatic: number; kinetic: number }

/** Friction on a 10 kg crate (weight 98 N) for each floor. */
export const SURFACES: Surface[] = [
  { id: 'ice', name: 'Ice', emoji: '🧊', maxStatic: 2, kinetic: 1 },
  { id: 'tiles', name: 'Tiles', emoji: '⬜', maxStatic: 30, kinetic: 20 },
  { id: 'carpet', name: 'Carpet', emoji: '🟫', maxStatic: 60, kinetic: 45 },
  { id: 'none', name: 'No friction', emoji: '🚀', maxStatic: 0, kinetic: 0 },
]

export const CRATE_KG = 10

/** Advance the crate by dt seconds. Friction never makes it reverse: it stops at rest instead. */
export function step(v: number, push: number, s: Surface, dt: number) {
  const moving = Math.abs(v) > 1e-6
  if (!moving) {
    const r = withFriction(push, s.maxStatic, s.kinetic, false)
    if (!r.moves) return { v: 0, net: 0, friction: r.friction }
    return { v: (r.net / CRATE_KG) * dt, net: r.net, friction: r.friction }
  }
  const friction = -Math.sign(v) * s.kinetic
  const net = push + friction
  const nv = v + (net / CRATE_KG) * dt
  // friction alone brought it to rest this step
  if (Math.sign(nv) !== Math.sign(v) && Math.abs(push) <= s.maxStatic) return { v: 0, net: 0, friction: -push + 0 }
  return { v: nv, net, friction }
}

export function describe(v: number, net: number) {
  const moving = Math.abs(v) > 0.01
  if (!moving && net === 0) return 'At rest: the forces are balanced.'
  if (net === 0) return `Moving ${v > 0 ? 'right' : 'left'} at a constant speed: balanced forces, so no change in motion.`
  const speedingUp = Math.sign(net) === Math.sign(v) || !moving
  return `${speedingUp ? 'Speeding up' : 'Slowing down'}: an unbalanced force of ${Math.abs(net).toFixed(0)} N to the ${net > 0 ? 'right' : 'left'}.`
}
