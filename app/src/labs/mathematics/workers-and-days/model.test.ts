import { describe, expect, it } from 'vitest'
import { days } from './model'

describe('inverse proportion', () => {
  it('product stays constant', () => {
    expect([1, 2, 3, 4, 5, 6, 10, 12].map((w) => days(w))).toEqual([60, 30, 20, 15, 12, 10, 6, 5])
    expect(days(60, 240)).toBe(4)
  })
})
