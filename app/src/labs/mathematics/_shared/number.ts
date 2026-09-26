export function primeFactors(n: number) {
  const out: number[] = []
  for (let f = 2; n > 1; f++) while (n % f === 0) { out.push(f); n /= f }
  return out
}
export const isPrime = (n: number) => n > 1 && primeFactors(n).length === 1

export function factors(n: number) {
  const out: number[] = []
  for (let f = 1; f * f <= n; f++) if (n % f === 0) out.push(f, n / f)
  return [...new Set(out)].sort((a, b) => a - b)
}

/** Prime factorisation grouped as [prime, power] pairs. */
export function primePowers(n: number): [number, number][] {
  const m = new Map<number, number>()
  for (const p of primeFactors(n)) m.set(p, (m.get(p) ?? 0) + 1)
  return [...m.entries()]
}
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export const sup = (k: number) => String(k).split('').map((d) => SUP[+d]).join('')
/** e.g. 72 → "2³ × 3²" */
export const powerForm = (n: number) => primePowers(n).map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(' × ')

export const isqrt = (n: number) => Math.floor(Math.sqrt(n) + 1e-9)
export const icbrt = (n: number) => Math.round(Math.cbrt(n))
export const isSquare = (n: number) => isqrt(n) ** 2 === n
export const isCube = (n: number) => icbrt(n) ** 3 === n
