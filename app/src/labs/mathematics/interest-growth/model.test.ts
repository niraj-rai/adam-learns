import { describe, expect, it } from 'vitest'
import { compoundAmount, depreciate, simpleAmount } from './model'

describe('interest and growth', () => {
  it('simple vs compound', () => {
    expect(simpleAmount(10000, 10, 2)).toBe(12000)
    expect(compoundAmount(10000, 10, 2)).toBeCloseTo(12100)
    expect(compoundAmount(10000, 10, 1, 2)).toBeCloseTo(11025)
  })
  it('depreciation', () => {
    expect(depreciate(50000, 10, 2)).toBeCloseTo(40500)
  })
})
