import { describe, expect, it } from 'vitest'
import { compass, displacement, distance, type Dir } from './model'

describe('displacement walker', () => {
  it('3 blocks east and 4 north', () => {
    const s: Dir[] = ['E', 'E', 'E', 'N', 'N', 'N', 'N']
    expect(distance(s)).toBe(700)
    const d = displacement(s)
    expect(d.mag).toBeCloseTo(500)
    expect(d.bearing).toBeCloseTo(36.87, 1)
    expect(compass(d.bearing)).toBe('NE')
  })
  it('a round trip has zero displacement', () => {
    expect(displacement(['N', 'E', 'S', 'W']).mag).toBe(0)
  })
})
