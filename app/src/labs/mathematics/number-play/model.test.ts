import { describe, expect, it } from 'vitest'
import { altSum, consecutiveWays, TESTS } from './model'

describe('number play', () => {
  it('divisibility tests agree with real division', () => {
    for (let n = 1; n <= 3000; n++) for (const t of TESTS) expect(t.check(n).ok, `${n} by ${t.d}`).toBe(n % t.d === 0)
    expect(altSum(918082)).toBe(-22) // −22 is a multiple of 11, so 918082 is too
  })
  it('finds consecutive sums, and powers of 2 have none', () => {
    expect(consecutiveWays(15)).toEqual([[7, 2], [4, 3], [1, 5]])
    for (const p of [1, 2, 4, 8, 16, 32, 64]) expect(consecutiveWays(p)).toEqual([])
  })
})
