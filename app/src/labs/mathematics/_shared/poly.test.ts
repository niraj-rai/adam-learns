import { describe, expect, it } from 'vitest'
import { add, evaluate, format, mul } from './poly'

describe('poly helpers', () => {
  it('formats nicely', () => {
    expect(format([6, -5, 1])).toBe('x² − 5x + 6')
    expect(format([0, -1])).toBe('−x')
    expect(format([0, 0])).toBe('0')
  })
  it('adds, multiplies and evaluates', () => {
    expect(format(add([2, 3], [-2, -1, 1]))).toBe('x² + 2x')
    expect(format(mul([3, 1], [2, 1]))).toBe('x² + 5x + 6')
    expect(format(mul([-4, 1], [4, 1]))).toBe('x² − 16')
    expect(evaluate([6, -5, 1], 4)).toBe(2)
  })
})

import { degree, divideByLinear, integerZeros } from './poly'

describe('remainder and factor theorems', () => {
  it('synthetic division gives the quotient and p(a) as remainder', () => {
    // x³ − 6x² + 11x − 6 = (x − 1)(x − 2)(x − 3)
    const p = [-6, 11, -6, 1]
    expect(divideByLinear(p, 1)).toMatchObject({ quotient: [6, -5, 1], remainder: 0 })
    expect(divideByLinear(p, 4).remainder).toBe(6)
    expect(integerZeros(p)).toEqual([1, 2, 3])
    expect(degree([0, 0, 3, 0])).toBe(2)
  })
})
