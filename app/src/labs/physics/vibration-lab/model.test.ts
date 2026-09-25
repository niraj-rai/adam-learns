import { describe, expect, it } from 'vitest'
import { rulerFrequency } from './model'

describe('vibrating ruler', () => {
  it('a shorter overhang vibrates faster (higher pitch)', () => {
    expect(rulerFrequency(10)).toBeGreaterThan(rulerFrequency(20))
    expect(rulerFrequency(10)).toBeCloseTo(160)
  })
})
