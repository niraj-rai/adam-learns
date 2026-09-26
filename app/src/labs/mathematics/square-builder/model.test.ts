import { describe, expect, it } from 'vitest'
import { layerOf, oddSum, SQUARE_ENDINGS } from './model'

describe('square builder', () => {
  it('n² is the sum of the first n odd numbers', () => {
    for (let n = 1; n <= 12; n++) expect(oddSum(n).reduce((a, b) => a + b, 0)).toBe(n * n)
    expect(layerOf(0, 0)).toBe(1)
    expect(layerOf(2, 1)).toBe(3)
  })
  it('squares only end in 0, 1, 4, 5, 6 or 9', () => {
    expect(SQUARE_ENDINGS).toEqual([0, 1, 4, 5, 6, 9])
  })
})
