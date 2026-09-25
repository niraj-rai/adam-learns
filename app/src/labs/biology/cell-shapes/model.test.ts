import { describe, expect, it } from 'vitest'
import { cubeStats } from './model'

describe('why cells are small', () => {
  it('a 1 µm cube has a surface-area-to-volume ratio of 6; a 10 µm cube only 0.6', () => {
    expect(cubeStats(1).ratio).toBe(6)
    expect(cubeStats(10).ratio).toBeCloseTo(0.6)
  })
  it('doubling the side quadruples the area but multiplies the volume by eight', () => {
    expect(cubeStats(4).area / cubeStats(2).area).toBe(4)
    expect(cubeStats(4).volume / cubeStats(2).volume).toBe(8)
  })
})
