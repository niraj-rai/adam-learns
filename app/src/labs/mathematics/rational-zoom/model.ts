import { add, frac, mul, type Frac } from '../_shared/fraction'

/** Long division of p/q (0 < p): integer part, digits after the point, and where the repeat starts (−1 if it terminates). */
export function expand(p: number, q: number, max = 40) {
  const int = Math.floor(p / q)
  let r = p % q
  const seen = new Map<number, number>()
  const digits: number[] = []
  while (r !== 0 && !seen.has(r) && digits.length < max) {
    seen.set(r, digits.length)
    r *= 10
    digits.push(Math.floor(r / q))
    r %= q
  }
  return { int, digits, repeatStart: r === 0 ? -1 : (seen.get(r) ?? -1) }
}

/** A fraction in lowest terms terminates exactly when its denominator has no prime factors other than 2 and 5. */
export function terminates(q: number) {
  while (q % 2 === 0) q /= 2
  while (q % 5 === 0) q /= 5
  return q === 1
}

export { primeFactors } from '../_shared/number'

export const midpoint = (a: Frac, b: Frac) => mul(add(a, b), frac(1, 2))
