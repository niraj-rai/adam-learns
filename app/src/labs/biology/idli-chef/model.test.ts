import { describe, expect, it } from 'vitest'
import { batterRise, batterVerdict, curdReady, safeOvernight, SPOTS } from './model'

describe('idli chef orders', () => {
  it('overnight (10 h) batter is only perfect in the warm oven', () => {
    const verdicts = SPOTS.map((s) => batterVerdict(batterRise(s.temp, 10)))
    expect(verdicts).toEqual(['flat', 'flat', 'perfect', 'flat'])
  })
  it('lukewarm milk with a starter sets by lunch; hot or cold milk does not', () => {
    expect(curdReady(40, true, 6)).toBe(true)
    expect(curdReady(95, true, 6)).toBe(false)
    expect(curdReady(12, true, 6)).toBe(false)
    expect(curdReady(40, false, 6)).toBe(false)
  })
  it('leftover sambar is safe overnight only if boiled and refrigerated, or refrigerated', () => {
    expect(safeOvernight('room')).toBe(false)
    expect(safeOvernight('boilfridge')).toBe(true)
    expect(safeOvernight('fridge')).toBe(true)
  })
})
