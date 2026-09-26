import { describe, expect, it } from 'vitest'
import { cuboidSA, cylinderTSA } from './model'

describe('surface area', () => {
  it('works', () => {
    expect(cuboidSA(5, 5, 5)).toBe(150)
    expect(cuboidSA(10, 5, 4)).toBe(220)
    expect(cylinderTSA(7, 10, 22 / 7)).toBeCloseTo(748)
  })
})
