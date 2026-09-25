import { describe, expect, it } from 'vitest'
import { blowFreq, bowlFreq, fillFor, inTune, SARGAM, stringFreq, tapFreq } from './model'

describe('musical instruments', () => {
  it('every sargam note can be tuned on a jal tarang bowl', () => {
    for (const n of SARGAM) {
      const fill = fillFor(n.f)
      expect(fill).toBeGreaterThan(0)
      expect(fill).toBeLessThanOrEqual(1)
      expect(inTune(bowlFreq(fill), n.f)).toBe(true)
    }
  })
  it('tighter or shorter strings give higher notes', () => {
    expect(stringFreq(0.8, 80)).toBeGreaterThan(stringFreq(0.8, 40))
    expect(stringFreq(0.4, 60)).toBeCloseTo(2 * stringFreq(0.8, 60))
  })
  it('adding water lowers the pitch when tapped but raises it when blown', () => {
    expect(tapFreq(0.8)).toBeLessThan(tapFreq(0.2))
    expect(blowFreq(0.8)).toBeGreaterThan(blowFreq(0.2))
  })
})
