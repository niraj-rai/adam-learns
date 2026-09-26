import { describe, expect, it } from 'vitest'
import { factorPairs, sharedFactors } from './model'

describe('factor tree', () => {
  it('lists factor pairs', () => {
    expect(factorPairs(36)).toEqual([[2, 18], [3, 12], [4, 9], [6, 6]])
    expect(factorPairs(13)).toEqual([])
  })
  it('finds HCF and LCM from shared primes', () => {
    expect(sharedFactors(12, 18)).toEqual({ onlyA: [2], both: [2, 3], onlyB: [3], hcf: 6, lcm: 36 })
    expect(sharedFactors(8, 15)).toMatchObject({ hcf: 1, lcm: 120 })
  })
})
