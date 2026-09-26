import { primePowers } from '../_shared/number'

/** Group prime factors in threes: ∛n = outside × ∛inside. */
export function simplifyCubeRoot(n: number) {
  let outside = 1
  let inside = 1
  for (const [p, k] of primePowers(n)) {
    outside *= p ** Math.floor(k / 3)
    inside *= p ** (k % 3)
  }
  return { outside, inside }
}

/** Numbers up to `max` that are a sum of two positive cubes in two different ways. */
export function taxicab(max: number) {
  const ways = new Map<number, [number, number][]>()
  for (let a = 1; a ** 3 < max; a++)
    for (let b = a; a ** 3 + b ** 3 <= max; b++) {
      const s = a ** 3 + b ** 3
      ways.set(s, [...(ways.get(s) ?? []), [a, b]])
    }
  return [...ways.entries()].filter(([, w]) => w.length > 1).sort((x, y) => x[0] - y[0])
}

/** The smallest number to multiply n by to make a perfect cube. */
export function cubeCompleter(n: number) {
  return primePowers(n).reduce((m, [p, k]) => m * p ** ((3 - (k % 3)) % 3), 1)
}
