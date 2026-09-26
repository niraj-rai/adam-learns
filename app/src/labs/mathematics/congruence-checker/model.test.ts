import { describe, expect, it } from 'vitest'
import { CASES } from './model'

describe('congruence rules', () => {
  it('five tests work and two do not', () => {
    expect(CASES.filter((c) => c.ok).map((c) => c.code)).toEqual(['SSS', 'SAS', 'ASA', 'AAS', 'RHS'])
    expect(CASES.filter((c) => !c.ok).map((c) => c.code)).toEqual(['AAA', 'SSA'])
  })
})
