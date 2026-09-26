import { describe, expect, it } from 'vitest'
import { bracket, refine, simplifyRoot } from './model'

describe('root finder', () => {
  it('brackets roots between perfect squares', () => {
    expect(bracket(50)).toEqual({ lo: 7, hi: 8 })
    expect(bracket(49)).toEqual({ lo: 7, hi: 7 })
  })
  it('pairs prime factors', () => {
    expect(simplifyRoot(144)).toEqual({ outside: 12, inside: 1 })
    expect(simplifyRoot(72)).toEqual({ outside: 6, inside: 2 })
  })
  it('refines a guess quickly', () => {
    expect(refine(2, 1, 4).at(-1)).toBeCloseTo(Math.SQRT2, 10)
  })
})
