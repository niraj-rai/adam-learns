import { describe, expect, it } from 'vitest'
import { add, compare, div, frac, mixed, mul, show, sub } from './fraction'

describe('fraction helpers', () => {
  it('keeps fractions in lowest terms with a positive denominator', () => {
    expect(frac(6, 8)).toEqual({ n: 3, d: 4 })
    expect(frac(3, -6)).toEqual({ n: -1, d: 2 })
  })
  it('does arithmetic', () => {
    expect(show(add(frac(1, 2), frac(1, 3)))).toBe('5/6')
    expect(show(sub(frac(3, 4), frac(5, 6)))).toBe('-1/12')
    expect(show(mul(frac(2, 3), frac(3, 4)))).toBe('1/2')
    expect(show(div(frac(3, 2), frac(1, 4)))).toBe('6')
    expect(compare(frac(3, 5), frac(5, 8))).toBe(-1)
    expect(mixed(frac(7, 3))).toBe('2 1/3')
  })
})
