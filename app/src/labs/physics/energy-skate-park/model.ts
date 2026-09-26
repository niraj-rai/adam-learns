import { G_EARTH } from '../_shared/dynamics'

/** A U-shaped half-pipe: y = H (x / L)², from x = −L to L. */
export const L = 5
export const H = 5
export const trackY = (x: number) => H * (x / L) ** 2
const slope = (x: number) => (2 * H * x) / (L * L)

export type Skater = { x: number; u: number } // u = speed along the track (signed)

/** Advance by dt with friction coefficient mu, in small sub-steps. */
export function advance(s: Skater, mu: number, dt: number, steps = 20): Skater {
  let { x, u } = s
  const h = dt / steps
  for (let i = 0; i < steps; i++) {
    const th = Math.atan(slope(x))
    const gAlong = -G_EARTH * Math.sin(th)
    const fric = mu * G_EARTH * Math.cos(th)
    if (Math.abs(u) < 1e-3 && Math.abs(gAlong) <= fric) return { x, u: 0 } // friction holds it still
    const dir = Math.abs(u) < 1e-3 ? Math.sign(gAlong) : Math.sign(u)
    u += (gAlong - dir * fric) * h
    if (dir !== 0 && Math.sign(u) !== dir && Math.abs(gAlong) <= fric) u = 0
    x += u * Math.cos(th) * h
    x = Math.max(-L, Math.min(L, x))
  }
  return { x, u }
}

export const startX = (h0: number) => -L * Math.sqrt(Math.min(h0, H) / H)
