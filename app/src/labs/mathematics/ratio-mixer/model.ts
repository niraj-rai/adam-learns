import { gcd } from '../_shared/fraction'

export const simplify = (parts: number[]) => { const g = parts.reduce((a, b) => gcd(a, b)); return parts.map((p) => p / g) }
/** Split a total in the given ratio. */
export const share = (total: number, parts: number[]) => { const s = parts.reduce((a, b) => a + b, 0); return parts.map((p) => (total * p) / s) }
/** Mix two hex colours: t = share of the second colour. */
export function mix(c1: string, c2: string, t: number) {
  const h = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16)
  return `#${[0, 1, 2].map((i) => Math.round(h(c1, i) * (1 - t) + h(c2, i) * t).toString(16).padStart(2, '0')).join('')}`
}
/** Map scale 1 : s — real distance in km for d cm on the map. */
export const mapToKm = (cm: number, s: number) => (cm * s) / 100000

/** Paint-like blue→yellow mixing: RGB averaging gives grey, so blend through a green midpoint. t = share of yellow. */
export const paint = (t: number) => (t < 0.5 ? mix('#2563eb', '#16a34a', t / 0.5) : mix('#16a34a', '#facc15', (t - 0.5) / 0.5))
