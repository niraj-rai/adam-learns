import { describe, expect, it } from 'vitest'
import { endpointVolume, pHAfter } from './model'

describe('titration', () => {
  it('starts acidic, is neutral at the endpoint and ends basic', () => {
    expect(pHAfter(25, 0.1, 0, 0.1)).toBeCloseTo(1)
    expect(pHAfter(25, 0.1, 25, 0.1)).toBe(7)
    expect(pHAfter(25, 0.1, 30, 0.1)).toBeGreaterThan(11)
  })
  it('finds the endpoint volume', () => {
    expect(endpointVolume(25, 0.1, 0.2)).toBe(12.5)
  })
})
