import { describe, expect, it } from 'vitest'
import { distance, midpoint, slope, solve2 } from './coord'

describe('coordinates', () => {
  it('distance and midpoint', () => {
    expect(distance({ x: 1, y: 2 }, { x: 4, y: 6 })).toBe(5)
    expect(midpoint({ x: -2, y: 3 }, { x: 4, y: 7 })).toEqual({ x: 1, y: 5 })
  })
  it('slope', () => {
    expect(slope({ x: 0, y: 1 }, { x: 2, y: 5 })).toBe(2)
    expect(slope({ x: 1, y: 1 }, { x: 1, y: 5 })).toBe(Infinity)
  })
  it('simultaneous equations', () => {
    expect(solve2(1, 1, 10, 1, -1, 2)).toEqual({ kind: 'unique', x: 6, y: 4 })
    expect(solve2(1, 2, 3, 2, 4, 6).kind).toBe('infinite')
    expect(solve2(1, 2, 3, 2, 4, 7).kind).toBe('none')
  })
})
