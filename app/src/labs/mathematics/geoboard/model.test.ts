import { describe, expect, it } from 'vitest'
import { area, boundary, interior, selfIntersects } from './model'

describe('geoboard', () => {
  it('shoelace and Pick agree', () => {
    const sq = [[0, 0], [2, 0], [2, 2], [0, 2]] as [number, number][]
    expect([area(sq), boundary(sq), interior(sq)]).toEqual([4, 8, 1])
    const trap = [[0, 0], [6, 0], [4, 3], [1, 3]] as [number, number][]
    expect(area(trap)).toBe(13.5) // (6 + 3) / 2 × 3
    expect(interior(trap) + boundary(trap) / 2 - 1).toBe(area(trap))
  })
  it('spots bow-ties', () => {
    expect(selfIntersects([[0, 0], [2, 2], [2, 0], [0, 2]])).toBe(true)
    expect(selfIntersects([[0, 0], [2, 0], [2, 2], [0, 2]])).toBe(false)
  })
})
