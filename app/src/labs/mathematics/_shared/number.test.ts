import { describe, expect, it } from 'vitest'
import { factors, isCube, isSquare, powerForm, primeFactors } from './number'

describe('number helpers', () => {
  it('factorises', () => {
    expect(primeFactors(360)).toEqual([2, 2, 2, 3, 3, 5])
    expect(powerForm(72)).toBe('2³ × 3²')
    expect(powerForm(1024)).toBe('2¹⁰')
    expect(factors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36])
  })
  it('spots squares and cubes', () => {
    expect([49, 50, 1, 0].map(isSquare)).toEqual([true, false, true, true])
    expect([1728, 1729, 3375].map(isCube)).toEqual([true, false, true])
  })
})
