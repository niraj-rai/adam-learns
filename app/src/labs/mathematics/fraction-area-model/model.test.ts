import { describe, expect, it } from 'vitest'
import { frac, show } from '../_shared/fraction'
import { fitCount } from './model'

describe('fraction area model', () => {
  it('counts how many pieces fit', () => {
    const r = fitCount(frac(3, 2), frac(1, 4))
    expect([show(r.q), r.whole, show(r.part)]).toEqual(['6', 6, '0'])
    const s = fitCount(frac(2), frac(3, 4))
    expect([show(s.q), s.whole, show(s.part)]).toEqual(['8/3', 2, '2/3'])
  })
})
