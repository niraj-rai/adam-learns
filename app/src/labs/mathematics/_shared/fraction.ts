/** A fraction n/d with d > 0, always kept in lowest terms. */
export type Frac = { n: number; d: number }

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a || 1
}
export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b)

export function frac(n: number, d = 1): Frac {
  if (d === 0) throw new Error('denominator cannot be 0')
  const s = d < 0 ? -1 : 1
  const g = gcd(n, d)
  return { n: (s * n) / g, d: (s * d) / g }
}
export const add = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d)
export const sub = (a: Frac, b: Frac) => frac(a.n * b.d - b.n * a.d, a.d * b.d)
export const mul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d)
export const div = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n)
export const value = (a: Frac) => a.n / a.d
export const equal = (a: Frac, b: Frac) => a.n * b.d === b.n * a.d
export const compare = (a: Frac, b: Frac) => Math.sign(a.n * b.d - b.n * a.d)
export const show = (a: Frac) => (a.d === 1 ? `${a.n}` : `${a.n}/${a.d}`)
/** Mixed-number text, e.g. 7/3 → "2 1/3". */
export function mixed(a: Frac) {
  if (Math.abs(a.n) < a.d || a.d === 1) return show(a)
  const w = Math.trunc(a.n / a.d)
  const r = Math.abs(a.n % a.d)
  return r ? `${w} ${r}/${a.d}` : `${w}`
}
