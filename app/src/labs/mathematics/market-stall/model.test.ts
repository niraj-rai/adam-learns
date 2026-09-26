import { describe, expect, it } from 'vitest'
import { afterDiscount, profitPercent, withGst } from './model'

describe('market stall', () => {
  it('discount then GST', () => {
    expect(afterDiscount(2000, 15)).toBe(1700)
    expect(withGst(1000, 18)).toBeCloseTo(1180)
    expect(profitPercent(1500, 1700)).toBeCloseTo(13.333, 2)
    expect(profitPercent(600, 540)).toBeCloseTo(-10)
  })
})
