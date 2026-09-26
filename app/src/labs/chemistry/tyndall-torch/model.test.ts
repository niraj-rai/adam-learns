import { describe, expect, it } from 'vitest'
import { PROPS, SAMPLES } from './model'

describe('tyndall torch', () => {
  it('has two samples of each kind', () => {
    for (const k of ['solution', 'colloid', 'suspension'] as const) expect(SAMPLES.filter((s) => s.kind === k)).toHaveLength(2)
  })
  it('only suspensions settle or leave a residue on filter paper; solutions never show a beam', () => {
    expect(PROPS.solution.beam).toBe(false)
    expect(PROPS.colloid.beam).toBe(true)
    expect(PROPS.colloid.settles || PROPS.colloid.filter).toBe(false)
    expect(PROPS.suspension.settles && PROPS.suspension.filter).toBe(true)
  })
})
