import { gcd } from '../_shared/fraction'

export type Pt = [number, number]
/** Shoelace formula for the area of a simple polygon. */
export function area(pts: Pt[]) {
  let s = 0
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    const [x2, y2] = pts[(i + 1) % pts.length]
    s += x1 * y2 - x2 * y1
  }
  return Math.abs(s) / 2
}
/** Lattice points on the boundary. */
export const boundary = (pts: Pt[]) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + gcd(Math.abs(q[0] - p[0]), Math.abs(q[1] - p[1])) }, 0)
/** Pick's theorem: A = I + B/2 − 1, so I = A − B/2 + 1. */
export const interior = (pts: Pt[]) => area(pts) - boundary(pts) / 2 + 1

/** Do any two non-adjacent edges cross? (A simple polygon has none.) */
export function selfIntersects(pts: Pt[]) {
  const n = pts.length
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue
      const [a, b, c, d] = [pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n]]
      const d1 = cross(c, d, a)
      const d2 = cross(c, d, b)
      const d3 = cross(a, b, c)
      const d4 = cross(a, b, d)
      if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true
    }
  return false
}
