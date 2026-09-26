import { describe, expect, it } from 'vitest'
import { tilesAlone, vertexSum } from './model'

describe('tilings', () => {
  it('only triangles, squares and hexagons tile alone', () => {
    expect([3, 4, 5, 6, 7, 8, 10, 12].filter(tilesAlone)).toEqual([3, 4, 6])
  })
  it('mixed vertices that fit', () => {
    expect([vertexSum([4, 8, 8]), vertexSum([3, 3, 4, 3, 4]), vertexSum([3, 12, 12]), vertexSum([3, 4, 6, 4])]).toEqual([360, 360, 360, 360])
    expect(vertexSum([5, 5, 5])).toBe(324)
  })
})
