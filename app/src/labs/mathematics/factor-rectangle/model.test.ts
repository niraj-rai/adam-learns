import { describe, expect, it } from 'vitest'
import { productPairs, splitMiddle } from './model'

describe('factor rectangle', () => {
  it('splits the middle term', () => {
    expect(splitMiddle(7, 12)).toEqual([3, 4])
    expect(splitMiddle(-1, -6)).toEqual([-3, 2])
    expect(splitMiddle(0, -9)).toEqual([-3, 3])
    expect(splitMiddle(1, 1)).toBeNull()
  })
  it('lists product pairs', () => {
    expect(productPairs(6)).toEqual([[-6, -1], [-3, -2], [1, 6], [2, 3]])
    expect(productPairs(-4)).toEqual([[-4, 1], [-2, 2], [-1, 4]])
  })
})
