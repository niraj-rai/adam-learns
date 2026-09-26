/**
 * Grade 10 optics with the New Cartesian sign convention: distances are measured from the pole/optical
 * centre; the object is on the left, so u is negative; distances to the right are positive.
 * Concave mirror and concave lens: f < 0 for the mirror (focus in front, on the left) and f < 0 for the lens.
 */

/** Mirror formula 1/v + 1/u = 1/f → v. Returns Infinity when the object is at the focus. */
export function mirrorImage(u: number, f: number) {
  const inv = 1 / f - 1 / u
  const v = Math.abs(inv) < 1e-12 ? Infinity : 1 / inv
  const m = Number.isFinite(v) ? -v / u : Infinity
  return { v, m, real: Number.isFinite(v) && v < 0, upright: m > 0 }
}

/** Lens formula 1/v − 1/u = 1/f → v. */
export function lensImage(u: number, f: number) {
  const inv = 1 / f + 1 / u
  const v = Math.abs(inv) < 1e-12 ? Infinity : 1 / inv
  const m = Number.isFinite(v) ? v / u : Infinity
  return { v, m, real: Number.isFinite(v) && v > 0, upright: m > 0 }
}

/** Power of a lens in dioptres, with f in metres. */
export const power = (fMetres: number) => 1 / fMetres

/** Snell's law n1 sin i = n2 sin r. Returns the angle of refraction in degrees, or null for total internal reflection. */
export function refract(n1: number, n2: number, iDeg: number) {
  const s = (n1 / n2) * Math.sin((iDeg * Math.PI) / 180)
  if (Math.abs(s) > 1) return null
  return (Math.asin(s) * 180) / Math.PI
}

/** Critical angle (degrees) going from a denser medium n1 into a rarer medium n2. */
export const criticalAngle = (n1: number, n2: number) => (n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : null)

export const MEDIA = [
  { id: 'air', name: 'Air', n: 1.0 },
  { id: 'water', name: 'Water', n: 1.33 },
  { id: 'glass', name: 'Crown glass', n: 1.52 },
  { id: 'diamond', name: 'Diamond', n: 2.42 },
] as const

/** Lens (in dioptres) needed to correct the eye: myopia uses the far point, hypermetropia the near point (metres). */
export const myopiaCorrection = (farPointM: number) => -1 / farPointM
export const hypermetropiaCorrection = (nearPointM: number, normalNear = 0.25) => 1 / normalNear - 1 / nearPointM
