export type ElementId = 'concave-mirror' | 'convex-mirror' | 'convex-lens' | 'concave-lens'

export const ELEMENTS: { id: ElementId; name: string; kind: 'mirror' | 'lens'; converging: boolean; uses: string }[] = [
  { id: 'concave-mirror', name: 'Concave mirror', kind: 'mirror', converging: true, uses: 'torch and headlight reflectors, shaving and make-up mirrors, dentists’ mirrors, solar cookers' },
  { id: 'convex-mirror', name: 'Convex mirror', kind: 'mirror', converging: false, uses: 'rear-view mirrors on vehicles, mirrors at blind corners on hill roads' },
  { id: 'convex-lens', name: 'Convex lens', kind: 'lens', converging: true, uses: 'magnifying glasses, cameras, projectors, spectacles for long-sightedness, the lens in your eye' },
  { id: 'concave-lens', name: 'Concave lens', kind: 'lens', converging: false, uses: 'spectacles for short-sightedness, door peepholes' },
]

export type Image = {
  /** Image distance (cm). Positive = real image (in front of a mirror / beyond a lens); negative = virtual. */
  v: number
  /** Magnification: negative = inverted. */
  m: number
  real: boolean
  upright: boolean
  size: 'magnified' | 'same size' | 'diminished'
  atInfinity: boolean
}

/**
 * Thin lens / mirror equation with the “real-is-positive” convention: 1/f = 1/u + 1/v, m = −v/u.
 * Converging elements have f > 0, diverging elements f < 0. u is the object distance (> 0).
 */
export function imageOf(u: number, f: number): Image {
  if (Math.abs(u - f) < 1e-9) return { v: Infinity, m: Infinity, real: true, upright: false, size: 'magnified', atInfinity: true }
  const v = (u * f) / (u - f)
  const m = -v / u
  const am = Math.abs(m)
  return { v, m, real: v > 0, upright: m > 0, size: Math.abs(am - 1) < 0.03 ? 'same size' : am > 1 ? 'magnified' : 'diminished', atInfinity: false }
}

/** Where the object is, in the words textbooks use. */
export function objectZone(u: number, f: number) {
  if (f < 0) return 'anywhere in front'
  const eps = 0.5
  if (Math.abs(u - 2 * f) < eps) return 'at 2F (C)'
  if (Math.abs(u - f) < eps) return 'at F'
  if (u > 2 * f) return 'beyond 2F (C)'
  if (u > f) return 'between F and 2F'
  return 'between F and the pole/centre'
}
