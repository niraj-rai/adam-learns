import { describe, expect, it } from 'vitest'
import { currentFor, fuseBlows, heatShare, units } from './model'

describe('heating effect and household circuits', () => {
  it('a 2300 W geyser draws 10 A on 230 V', () => {
    expect(currentFor([2300])).toBeCloseTo(10)
  })
  it('a geyser plus an induction cooktop blows a 15 A fuse', () => {
    expect(fuseBlows(currentFor([2000, 2000]), 15)).toBe(true)
    expect(fuseBlows(currentFor([2000, 75, 36]), 15)).toBe(false)
  })
  it('in series, the nichrome wire gets almost all the heat', () => {
    const [cu, ni] = heatShare([0.05, 5])
    expect(ni).toBeGreaterThan(0.98)
    expect(cu).toBeLessThan(0.02)
  })
  it('a 1000 W iron used for 2 hours uses 2 units', () => {
    expect(units(1000, 2)).toBe(2)
  })
})
