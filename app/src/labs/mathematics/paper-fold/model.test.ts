import { describe, expect, it } from 'vitest'
import { foldsToReach, formatLength, thickness } from './model'

describe('paper fold', () => {
  it('doubles each fold', () => {
    expect(thickness(10)).toBeCloseTo(0.1024)
    expect(formatLength(thickness(10))).toBe('10.2 cm')
  })
  it('42 folds would reach the Moon', () => {
    expect(foldsToReach(384_400_000)).toBe(42)
    expect(foldsToReach(8849)).toBe(27)
  })
})
