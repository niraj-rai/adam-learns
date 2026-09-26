/** Digits of n in base b, most significant first. */
export function toBase(n: number, b: number) {
  if (n === 0) return [0]
  const out: number[] = []
  while (n > 0) { out.unshift(n % b); n = Math.floor(n / b) }
  return out
}
export const fromDigits = (ds: number[], b: number) => ds.reduce((s, d) => s * b + d, 0)

const ROMAN: [number, string][] = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
export function toRoman(n: number) {
  let s = ''
  for (const [v, r] of ROMAN) while (n >= v) { s += r; n -= v }
  return s
}
/** Returns null for anything that isn't a correctly written numeral from 1 to 3999. */
export function fromRoman(s: string) {
  const t = s.toUpperCase().trim()
  const V: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  if (!t || [...t].some((c) => !(c in V))) return null
  let n = 0
  for (let i = 0; i < t.length; i++) n += V[t[i]] < (V[t[i + 1]] ?? 0) ? -V[t[i]] : V[t[i]]
  return n > 0 && n < 4000 && toRoman(n) === t ? n : null
}
