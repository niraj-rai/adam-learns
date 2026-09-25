import { describe, expect, it } from 'vitest'
import { dayLength, dayOf21st, declination, noonAltitude } from './model'

describe('seasons', () => {
  it('declination swings between about +23.4° in June and −23.4° in December', () => {
    expect(declination(172)).toBeCloseTo(23.4, 0)
    expect(declination(355)).toBeCloseTo(-23.4, 0)
  })
  it('around the equinoxes, day and night are about 12 hours everywhere', () => {
    expect(dayLength(28.6, 80)).toBeCloseTo(12, 0)
    expect(dayLength(51.5, 266)).toBeCloseTo(12, 0)
  })
  it('Delhi has longer days in June than December; the equator stays about 12 h', () => {
    expect(dayLength(28.6, dayOf21st(5))).toBeGreaterThan(13.5)
    expect(dayLength(28.6, dayOf21st(11))).toBeLessThan(10.6)
    expect(dayLength(0, dayOf21st(5))).toBeCloseTo(12, 0)
  })
  it('the midnight Sun: 24 hours of daylight in the Arctic in June', () => {
    expect(dayLength(69.65, 172)).toBe(24)
  })
  it('the noon Sun is overhead in Bengaluru in late April (zero-shadow day)', () => {
    expect(noonAltitude(12.97, 114)).toBeGreaterThan(89.5)
  })
})
