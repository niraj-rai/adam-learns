import { describe, expect, it } from 'vitest'
import { value } from '../_shared/fraction'
import { EXPERIMENTS, eventProbability, outcomes } from './model'

const ex = (id: string) => EXPERIMENTS.find((e) => e.id === id)!

describe('tree diagrams', () => {
  it('outcome probabilities add to 1', () => {
    for (const e of EXPERIMENTS) expect(outcomes(e).reduce((s, o) => s + value(o.p), 0)).toBeCloseTo(1)
  })
  it('computes event probabilities', () => {
    expect(eventProbability(ex('coins'), (a, b) => a === 'H' || b === 'H')).toEqual({ n: 3, d: 4 })
    expect(eventProbability(ex('bag-replace'), (a, b) => a === 'R' && b === 'R')).toEqual({ n: 9, d: 25 })
    expect(eventProbability(ex('bag-no-replace'), (a, b) => a === 'R' && b === 'R')).toEqual({ n: 3, d: 10 })
  })
})
