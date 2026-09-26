import { describe, expect, it } from 'vitest'
import { mean, median, modes, range, rng } from './stats'

describe('stats helpers', () => {
  it('computes averages', () => {
    expect(mean([4, 7, 9, 10, 15])).toBe(9)
    expect(median([3, 8, 5, 12, 7, 10])).toBe(7.5)
    expect(modes([2, 3, 3, 5, 7, 7, 7, 9])).toEqual([7])
    expect(modes([1, 2, 3])).toEqual([])
    expect(range([12, 45, 23, 38])).toBe(33)
  })
  it('seeded random numbers repeat', () => {
    const a = rng(1)
    const b = rng(1)
    expect([a(), a()]).toEqual([b(), b()])
  })
})
