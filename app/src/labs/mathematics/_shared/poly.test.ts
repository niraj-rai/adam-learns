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
