import { describe, expect, it } from 'vitest'
import { curdHours, doughRise, yeastActivity } from './model'

describe('fermentation', () => {
  it('yeast works best when warm, slowly when cold, not at all when too hot', () => {
    expect(yeastActivity(35)).toBe(1)
    expect(yeastActivity(10)).toBeLessThan(0.1)
    expect(yeastActivity(60)).toBe(0)
  })
  it('warm dough with more yeast and sugar rises more', () => {
    expect(doughRise(35, 1, 1, false)).toBeGreaterThan(doughRise(15, 1, 1, false))
    expect(doughRise(35, 1, 1, true)).toBeGreaterThan(doughRise(35, 1, 1, false))
    expect(doughRise(35, 0, 2, true)).toBe(0)
  })
  it('curd sets in about 5–6 hours at 40 °C but never in hot or starter-less milk', () => {
    expect(curdHours(40, true)).toBeLessThanOrEqual(6)
    expect(curdHours(25, true)).toBeGreaterThan(curdHours(40, true))
    expect(curdHours(70, true)).toBe(Infinity)
    expect(curdHours(40, false)).toBe(Infinity)
  })
})
