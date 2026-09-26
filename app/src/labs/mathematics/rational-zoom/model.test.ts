import { describe, expect, it } from 'vitest'
import { frac, show } from '../_shared/fraction'
import { expand, midpoint, primeFactors, terminates } from './model'

describe('rational zoom', () => {
  it('expands terminating and recurring decimals', () => {
    expect(expand(3, 8)).toEqual({ int: 0, digits: [3, 7, 5], repeatStart: -1 })
    expect(expand(1, 3)).toEqual({ int: 0, digits: [3], repeatStart: 0 })
    expect(expand(1, 6)).toEqual({ int: 0, digits: [1, 6], repeatStart: 1 })
    expect(expand(22, 7)).toEqual({ int: 3, digits: [1, 4, 2, 8, 5, 7], repeatStart: 0 })
  })
  it('knows which fractions terminate', () => {
    expect([8, 20, 3, 12, 25, 14].map(terminates)).toEqual([true, true, false, false, true, false])
    expect(primeFactors(60)).toEqual([2, 2, 3, 5])
  })
  it('there is always a fraction in between', () => {
    expect(show(midpoint(frac(1, 3), frac(1, 2)))).toBe('5/12')
  })
})
