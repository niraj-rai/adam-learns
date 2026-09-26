import { describe, expect, it } from 'vitest'
import { nearRound, squareParts } from './model'

describe('identities', () => {
  it('squares near round numbers', () => {
    expect(nearRound(103)).toEqual([100, 3])
    expect(nearRound(98)).toEqual([100, -2])
    expect(nearRound(47)).toEqual([50, -3])
    for (const n of [103, 98, 47, 61, 199]) {
      const [a, b] = nearRound(n)
      expect(squareParts(a, b).reduce((s, x) => s + x, 0)).toBe(n * n)
    }
  })
})
