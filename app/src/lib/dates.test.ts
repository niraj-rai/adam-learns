import { describe, expect, it } from 'vitest'
import { localDate, localDateOffset } from './dates'

describe('local dates', () => {
  it('formats the local calendar date', () => {
    expect(localDate(new Date(2026, 0, 5, 1, 30))).toBe('2026-01-05')
  })
  it('offsets across month ends', () => {
    expect(localDateOffset(1, new Date(2026, 0, 31, 12))).toBe('2026-02-01')
    expect(localDateOffset(-1, new Date(2026, 2, 1, 12))).toBe('2026-02-28')
  })
})
