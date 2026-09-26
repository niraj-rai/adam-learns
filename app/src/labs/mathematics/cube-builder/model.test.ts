import { describe, expect, it } from 'vitest'
import { cubeCompleter, simplifyCubeRoot, taxicab } from './model'

describe('cube builder', () => {
  it('groups primes in threes', () => {
    expect(simplifyCubeRoot(1728)).toEqual({ outside: 12, inside: 1 })
    expect(simplifyCubeRoot(500)).toEqual({ outside: 5, inside: 4 })
    expect([500, 250, 1728, 72].map(cubeCompleter)).toEqual([2, 4, 1, 3])
  })
  it('1729 is the smallest taxicab number', () => {
    expect(taxicab(5000)).toEqual([[1729, [[1, 12], [9, 10]]], [4104, [[2, 16], [9, 15]]]])
  })
})
