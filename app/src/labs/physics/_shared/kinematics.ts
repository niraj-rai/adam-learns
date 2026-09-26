/** Uniform acceleration from rest position 0: v = u + at, s = ut + ½at². */
export const velocityAt = (u: number, a: number, t: number) => u + a * t
export const positionAt = (u: number, a: number, t: number) => u * t + 0.5 * a * t * t

export type Knowns = Partial<Record<'u' | 'v' | 'a' | 't' | 's', number>>
export type Suvat = Required<Knowns>

/**
 * Solve the equations of uniform acceleration from exactly three of u, v, a, t, s
 * (one case per combination). Returns null when no real, forward-in-time answer exists.
 */
export function solveSuvat(k: Knowns): Suvat | null {
  const keys = (['u', 'v', 'a', 't', 's'] as const).filter((x) => k[x] !== undefined && Number.isFinite(k[x]))
  if (keys.length < 3) return null
  const [p, q, r] = keys
  const id = [p, q, r].join('')
  const { u, v, a, t, s } = k as Suvat
  const root = (x: number) => (x < -1e-12 ? NaN : Math.sqrt(Math.max(0, x)))
  let res: Suvat
  switch (id) {
    case 'uva': res = { u, v, a, t: (v - u) / a, s: (v * v - u * u) / (2 * a) }; break
    case 'uvt': res = { u, v, t, a: (v - u) / t, s: ((u + v) / 2) * t }; break
    case 'uvs': res = { u, v, s, t: (2 * s) / (u + v), a: (v * v - u * u) / (2 * s) }; break
    case 'uat': res = { u, a, t, v: u + a * t, s: u * t + 0.5 * a * t * t }; break
    case 'uas': { const vv = root(u * u + 2 * a * s); res = { u, a, s, v: vv, t: (vv - u) / a }; break }
    case 'uts': { const aa = (2 * (s - u * t)) / (t * t); res = { u, t, s, a: aa, v: u + aa * t }; break }
    case 'vat': res = { v, a, t, u: v - a * t, s: v * t - 0.5 * a * t * t }; break
    case 'vas': { const uu = root(v * v - 2 * a * s); res = { v, a, s, u: uu, t: (v - uu) / a }; break }
    case 'vts': { const uu = (2 * s) / t - v; res = { v, t, s, u: uu, a: (v - uu) / t }; break }
    case 'ats': { const uu = s / t - 0.5 * a * t; res = { a, t, s, u: uu, v: uu + a * t }; break }
    default: return null
  }
  if (!Object.values(res).every(Number.isFinite) || res.t < 0) return null
  return res
}
