import { describe, expect, it } from 'vitest'
import { edges, PATTERNS, sticks } from './model'

describe('matchstick patterns', () => {
  it('counts sticks', () => {
    const [sq, tri, hex, lad] = PATTERNS
    expect([1, 2, 3].map((n) => sticks(sq, n))).toEqual([4, 7, 10])
    expect([1, 2, 3].map((n) => sticks(tri, n))).toEqual([3, 5, 7])
    expect([1, 2].map((n) => sticks(hex, n))).toEqual([6, 11])
    expect(sticks(lad, 1)).toBe(5)
  })
  it('drawings use exactly the predicted number of sticks', () => {
    for (const p of PATTERNS) for (let n = 1; n <= 8; n++) expect(edges(p.id, n).length, `${p.id} ${n}`).toBe(sticks(p, n))
  })
})
