import { describe as suite, expect, it } from 'vitest'
import { shells, valency } from '../../_kit/elements'
import { CHALLENGES, describe } from './model'

suite('atom builder', () => {
  it('describes element, mass number and charge', () => {
    const na = describe({ p: 11, n: 12, e: 10 })
    expect(na.el?.symbol).toBe('Na')
    expect(na.massNumber).toBe(23)
    expect(na.charge).toBe(1)
    expect(describe({ p: 17, n: 18, e: 18 }).chargeLabel).toBe('negative ion (1−)')
    expect(describe({ p: 6, n: 6, e: 6 }).isotopeNote).toBe('the most common isotope')
  })

  it('every challenge target is a real element', () => {
    for (const c of CHALLENGES) expect(describe(c.target).el, c.id).toBeDefined()
  })

  it('shells and valency follow the 2, 8, 8 rule', () => {
    expect(shells(11)).toEqual([2, 8, 1])
    expect(shells(18)).toEqual([2, 8, 8])
    expect(shells(20)).toEqual([2, 8, 8, 2])
    expect(valency(8)).toBe(2)
    expect(valency(17)).toBe(1)
    expect(valency(10)).toBe(0)
    expect(valency(6)).toBe(4)
  })
})
