import { describe, expect, it } from 'vitest'
import { formatHours, safeHours } from './model'

describe('noise exposure', () => {
  it('85 dB is safe for 8 hours, and every +3 dB halves the time', () => {
    expect(safeHours(85)).toBe(8)
    expect(safeHours(88)).toBe(4)
    expect(safeHours(100)).toBeCloseTo(0.25)
  })
  it('very loud sounds are only safe for seconds', () => {
    expect(formatHours(safeHours(140))).toMatch(/second/)
  })
})
