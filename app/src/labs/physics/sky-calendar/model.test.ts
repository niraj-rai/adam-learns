import { describe, expect, it } from 'vitest'
import { driftPerYear, festivalDay, monthsBetweenLeapMonths, yearsToCycle } from './model'

describe('calendars', () => {
  it('a lunar year is about 11 days shorter than a solar year', () => {
    expect(driftPerYear).toBeCloseTo(10.9, 1)
  })
  it('a lunar festival goes all the way round the seasons in about 33 years', () => {
    expect(yearsToCycle).toBeGreaterThan(32)
    expect(yearsToCycle).toBeLessThan(35)
  })
  it('the Hindu calendar needs a leap month (adhik maas) roughly every 32–33 months', () => {
    expect(monthsBetweenLeapMonths).toBeGreaterThan(32)
    expect(monthsBetweenLeapMonths).toBeLessThan(33.5)
  })
  it('solar dates stay put; lunisolar dates stay within a month; lunar dates wander', () => {
    for (let y = 0; y < 40; y++) {
      expect(festivalDay('solar', 14, y)).toBe(14)
      const ls = festivalDay('lunisolar', 300, y)
      expect(ls).toBeLessThanOrEqual(300)
      expect(ls).toBeGreaterThan(300 - 30)
    }
    expect(Math.abs(festivalDay('lunar', 100, 10) - 100)).toBeGreaterThan(100)
  })
})
