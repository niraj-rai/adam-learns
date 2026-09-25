import { describe, expect, it } from 'vitest'
import { shadowLength, sunPosition } from './model'

describe('the Sun across the sky (equinox, Bengaluru)', () => {
  const LAT = 12.97
  it('rises in the east at about 6 am and sets in the west at about 6 pm', () => {
    const rise = sunPosition(LAT, 0, 6)
    expect(rise.alt).toBeCloseTo(0, 0)
    expect(rise.az).toBeCloseTo(90, 0)
    expect(sunPosition(LAT, 0, 18).az).toBeCloseTo(270, 0)
  })
  it('is highest at noon, at 90° − latitude', () => {
    expect(sunPosition(LAT, 0, 12).alt).toBeCloseTo(90 - LAT, 1)
    expect(sunPosition(LAT, 0, 12).alt).toBeGreaterThan(sunPosition(LAT, 0, 9).alt)
  })
  it('shadows are longest in the morning and evening, shortest at noon', () => {
    const noon = shadowLength(1, sunPosition(LAT, 0, 12).alt)
    const morning = shadowLength(1, sunPosition(LAT, 0, 8).alt)
    expect(morning).toBeGreaterThan(noon * 5)
    expect(shadowLength(1, -5)).toBe(Infinity)
  })
})
