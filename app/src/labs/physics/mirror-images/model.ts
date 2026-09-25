import { reflect } from '../reflection-lab/model'

/** Capital letters that look the same in a mirror (they have a vertical line of symmetry). */
export const SYMMETRIC = new Set('AHIMOTUVWXY'.split(''))

/** A word reads the same in a mirror if it is a palindrome made only of symmetric letters, e.g. MOM, WOW. */
export function readsSameInMirror(word: string) {
  const w = word.toUpperCase().replace(/\s+/g, '')
  return w.length > 0 && [...w].every((c) => SYMMETRIC.has(c)) && w === [...w].reverse().join('')
}

/**
 * Periscope: light enters the top opening travelling left (−x), hits the top mirror, then (if aimed down the tube) the
 * bottom mirror, and must leave travelling left into the eye. Mirror angles are measured from the horizontal.
 */
export function periscopeTrace(topDeg: number, bottomDeg: number) {
  const d1 = reflect(-1, 0, topDeg)
  const downTube = Math.abs(d1.dx) < 0.05 && d1.dy < 0
  const d2 = downTube ? reflect(d1.dx, d1.dy, bottomDeg) : null
  const works = Boolean(d2 && d2.dx < -0.99)
  return { d1, d2, downTube, works }
}
