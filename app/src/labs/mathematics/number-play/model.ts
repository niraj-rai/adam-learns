export const digits = (n: number) => String(n).split('').map(Number)
export const digitSum = (n: number) => digits(n).reduce((a, b) => a + b, 0)
/** Alternating sum from the ones digit: + − + … (the test for 11). */
export const altSum = (n: number) => digits(n).reverse().reduce((s, d, i) => s + (i % 2 ? -d : d), 0)

export type Test = { d: number; rule: string; check: (n: number) => { ok: boolean; why: string } }
export const TESTS: Test[] = [
  { d: 2, rule: 'Last digit is even', check: (n) => ({ ok: n % 2 === 0, why: `last digit ${n % 10}` }) },
  { d: 3, rule: 'Digit sum divisible by 3', check: (n) => ({ ok: digitSum(n) % 3 === 0, why: `digit sum ${digitSum(n)}` }) },
  { d: 4, rule: 'Last two digits divisible by 4', check: (n) => ({ ok: (n % 100) % 4 === 0, why: `last two digits ${String(n % 100).padStart(2, '0')}` }) },
  { d: 5, rule: 'Ends in 0 or 5', check: (n) => ({ ok: n % 5 === 0, why: `last digit ${n % 10}` }) },
  { d: 6, rule: 'Divisible by 2 and by 3', check: (n) => ({ ok: n % 6 === 0, why: `even: ${n % 2 === 0 ? 'yes' : 'no'}, digit sum ${digitSum(n)}` }) },
  { d: 8, rule: 'Last three digits divisible by 8', check: (n) => ({ ok: (n % 1000) % 8 === 0, why: `last three digits ${String(n % 1000).padStart(3, '0')}` }) },
  { d: 9, rule: 'Digit sum divisible by 9', check: (n) => ({ ok: digitSum(n) % 9 === 0, why: `digit sum ${digitSum(n)}` }) },
  { d: 10, rule: 'Ends in 0', check: (n) => ({ ok: n % 10 === 0, why: `last digit ${n % 10}` }) },
  { d: 11, rule: 'Alternating digit sum divisible by 11', check: (n) => ({ ok: altSum(n) % 11 === 0, why: `alternating sum ${altSum(n)}` }) },
]

/** Ways to write n as a sum of two or more consecutive positive integers, as [first, count]. */
export function consecutiveWays(n: number) {
  const out: [number, number][] = []
  for (let k = 2; (k * (k + 1)) / 2 <= n; k++) {
    const rest = n - (k * (k - 1)) / 2
    if (rest % k === 0) out.push([rest / k, k])
  }
  return out
}
