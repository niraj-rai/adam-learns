import { describe, expect, it } from 'vitest'
import { mapToKm, mix, paint, share, simplify } from './model'

describe('ratio mixer', () => {
  it('simplifies and shares', () => {
    expect(simplify([24, 36])).toEqual([2, 3])
    expect(simplify([6, 9, 12])).toEqual([2, 3, 4])
    expect(share(1200, [2, 3, 5])).toEqual([240, 360, 600])
  })
  it('mixes colours and reads maps', () => {
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(mapToKm(4, 50000)).toBe(2)
    expect(paint(0.5)).toBe('#16a34a')
  })
})
