import { primePowers, isqrt } from '../_shared/number'

/** The perfect squares either side of n. */
export const bracket = (n: number) => {
  const a = isqrt(n)
  return { lo: a, hi: a * a === n ? a : a + 1 }
}

/** Pair up prime factors: √n = outside × √inside. */
export function simplifyRoot(n: number) {
  let outside = 1
  let inside = 1
  for (const [p, k] of primePowers(n)) {
    outside *= p ** Math.floor(k / 2)
    inside *= p ** (k % 2)
  }
  return { outside, inside }
}

/** Guess, divide, average: each step gets closer to √n. */
export function refine(n: number, guess: number, steps: number) {
  const out = [guess]
  for (let i = 0; i < steps; i++) out.push((out[i] + n / out[i]) / 2)
  return out
}
