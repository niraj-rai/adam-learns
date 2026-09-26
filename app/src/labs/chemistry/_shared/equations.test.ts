import { describe, expect, it } from 'vitest'
import { EQUATIONS, atomCounts, isBalanced, solve } from './equations'

describe('balancing equations', () => {
  it('counts atoms', () => {
    expect(atomCounts(['H2O'], [2])).toEqual({ H: 4, O: 2 })
  })
  it('checks balance', () => {
    const eq = { reactants: ['H2', 'O2'], products: ['H2O'] }
    expect(isBalanced(eq, [2, 1, 2])).toBe(true)
    expect(isBalanced(eq, [1, 1, 1])).toBe(false)
  })
  it('every equation in the lab can be balanced with small whole numbers', () => {
    for (const e of EQUATIONS) expect(solve(e, 12), e.name).not.toBeNull()
    expect(solve(EQUATIONS.find((e) => e.name === 'Methane (CNG) burns')!)).toEqual([1, 2, 1, 2])
  })
})
