import { gcd } from './fraction'

/** Long division of p/q (0 < p, q > 0): the decimal digits, and where the repeating block starts (−1 if it terminates). */
export function longDivision(p: number, q: number, maxDigits = 60) {
  const whole = Math.floor(p / q)
  let r = p % q
  const digits: number[] = []
  const remainders: number[] = []
  const seen = new Map<number, number>()
  while (r !== 0 && !seen.has(r) && digits.length < maxDigits) {
    seen.set(r, digits.length)
    remainders.push(r)
    r *= 10
    digits.push(Math.floor(r / q))
    r %= q
  }
  const repeatStart = r === 0 ? -1 : seen.get(r) ?? -1
  return { whole, digits, remainders, repeatStart }
}

/** Terminates iff the reduced denominator has no prime factors other than 2 and 5. */
export function terminates(p: number, q: number) {
  let d = q / gcd(p, q)
  for (const f of [2, 5]) while (d % f === 0) d /= f
  return d === 1
}

/** Format p/q as a decimal with the repeating block in brackets, e.g. 1/6 → 0.1(6). */
export function decimalString(p: number, q: number) {
  const { whole, digits, repeatStart } = longDivision(p, q)
  if (!digits.length) return `${whole}`
  if (repeatStart < 0) return `${whole}.${digits.join('')}`
  return `${whole}.${digits.slice(0, repeatStart).join('')}(${digits.slice(repeatStart).join('')})`
}

/** 0.ab(cd…) → fraction: nonRepeating = 'ab', repeating = 'cd'. Returns [numerator, denominator] in lowest terms. */
export function recurringToFraction(nonRepeating: string, repeating: string): [number, number] {
  const a = nonRepeating.length
  const b = repeating.length
  const all = Number(nonRepeating + repeating || '0')
  const head = Number(nonRepeating || '0')
  const num = b ? all - head : all
  const den = b ? (10 ** b - 1) * 10 ** a : 10 ** a
  const g = gcd(num, den) || 1
  return [num / g, den / g]
}

/** √n = a√b with b square-free. */
export function simplifySurd(n: number): [number, number] {
  let a = 1
  let b = n
  for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) {
    if (n % (k * k) === 0) { a = k; b = n / (k * k); break }
  }
  return [a, b]
}

export const isPerfectSquare = (n: number) => Number.isInteger(Math.sqrt(n))
