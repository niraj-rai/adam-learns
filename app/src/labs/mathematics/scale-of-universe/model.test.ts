import { describe, expect, it } from 'vitest'
import { sci, toSci } from './model'

describe('scale of the universe', () => {
  it('writes numbers in standard form', () => {
    expect(toSci(384_400_000)).toEqual({ a: 3.844, n: 8 })
    expect(toSci(0.00000075)).toEqual({ a: 7.5, n: -7 })
    expect(toSci(9999.9, 3)).toEqual({ a: 1, n: 4 })
    expect(sci(0.00045)).toBe('4.5 × 10⁻⁴')
  })
})
