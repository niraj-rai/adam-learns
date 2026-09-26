import { describe, expect, it } from 'vitest'
import { exteriorEach, interiorEach, interiorSum, SHAPES } from './model'

describe('quadrilaterals and polygons', () => {
  it('a square has every property; every parallelogram-family shape has opposite sides parallel', () => {
    expect(SHAPES[0].has.every(Boolean)).toBe(true)
    for (const s of SHAPES.filter((x) => ['square', 'rectangle', 'rhombus', 'parallelogram'].includes(x.id))) expect(s.has[0] && s.has[4] && s.has[5]).toBe(true)
  })
  it('polygon angles', () => {
    expect([interiorSum(4), interiorSum(5), interiorEach(6), exteriorEach(8)]).toEqual([360, 540, 120, 45])
  })
})
