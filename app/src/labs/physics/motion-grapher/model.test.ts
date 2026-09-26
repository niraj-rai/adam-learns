import { describe, expect, it } from 'vitest'
import { PRESETS, simulate } from './model'

describe('motion grapher', () => {
  it('area under v–t equals displacement', () => {
    const r = simulate(PRESETS[0].segs)
    expect(r.at(-1)!.v).toBeCloseTo(0)
    expect(r.at(-1)!.s).toBeCloseTo(100) // 25 + 50 + 25
  })
  it('a ball thrown up at 15 m/s is back where it started after 3 s', () => {
    const r = simulate(PRESETS[1].segs, 15)
    expect(r.at(-1)!.s).toBeCloseTo(0)
    expect(Math.max(...r.map((p) => p.s))).toBeCloseTo(11.25, 1)
  })
})
