import { describe, expect, it } from 'vitest'
import { fourthCorner, quadrant, SHAPES } from './model'

describe('plot it', () => {
  it('names quadrants', () => {
    expect([quadrant([2, 3]), quadrant([-2, 3]), quadrant([-2, -3]), quadrant([2, -3]), quadrant([0, 4])]).toEqual(['I', 'II', 'III', 'IV', 'y-axis'])
  })
  it('completes shapes', () => {
    expect(SHAPES.map((s) => fourthCorner(...s.pts))).toEqual([[-3, -1], [1, 4], [2, -3], [0, 1]])
  })
})
