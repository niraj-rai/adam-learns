import type { Pt } from './coord'

/** Angle ABC in degrees (at vertex B). */
export function angleAt(A: Pt, B: Pt, C: Pt) {
  const a1 = Math.atan2(A.y - B.y, A.x - B.x)
  const a2 = Math.atan2(C.y - B.y, C.x - B.x)
  let d = Math.abs(a1 - a2) * (180 / Math.PI)
  if (d > 180) d = 360 - d
  return d
}

/** Heron's formula for a triangle with sides a, b, c (NaN if impossible). */
export function heron(a: number, b: number, c: number) {
  const s = (a + b + c) / 2
  const q = s * (s - a) * (s - b) * (s - c)
  return q < 0 ? NaN : Math.sqrt(q)
}

export const isTriangle = (a: number, b: number, c: number) => a + b > c && b + c > a && a + c > b

/** Brahmagupta's formula for a cyclic quadrilateral with sides a, b, c, d. */
export function brahmagupta(a: number, b: number, c: number, d: number) {
  const s = (a + b + c + d) / 2
  return Math.sqrt((s - a) * (s - b) * (s - c) * (s - d))
}

export const arcLength = (r: number, deg: number) => (deg / 360) * 2 * Math.PI * r
export const sectorArea = (r: number, deg: number) => (deg / 360) * Math.PI * r * r

export const cone = (r: number, h: number) => {
  const l = Math.hypot(r, h)
  return { l, curved: Math.PI * r * l, total: Math.PI * r * (l + r), volume: (Math.PI * r * r * h) / 3 }
}
export const sphere = (r: number) => ({ surface: 4 * Math.PI * r * r, volume: (4 / 3) * Math.PI * r ** 3 })
export const cylinder = (r: number, h: number) => ({ curved: 2 * Math.PI * r * h, volume: Math.PI * r * r * h })
