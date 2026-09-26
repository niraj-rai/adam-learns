import { describe, expect, it } from 'vitest'
import { resultExponent } from './model'

describe('exponent laws', () => {
  it('matches repeated multiplication', () => {
    for (const [m, n] of [[2, 3], [5, 1], [4, 4]]) {
      expect(2 ** m * 2 ** n).toBe(2 ** resultExponent('multiply', m, n))
      expect(3 ** m / 3 ** n).toBeCloseTo(3 ** resultExponent('divide', m, n))
      expect((2 ** m) ** n).toBe(2 ** resultExponent('power', m, n))
    }
  })
})
