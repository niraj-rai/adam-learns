import { describe, expect, it } from 'vitest'
import { ladder, QUICK, result } from './model'

describe('sign patterns', () => {
  it('the ladder for −3 goes up by 3 each step', () => {
    expect(ladder(-3).map((r) => r.p)).toEqual([-9, -6, -3, 0, 3, 6, 9])
  })
  it('quick answers are integers', () => {
    expect(QUICK.map(result)).toEqual([-24, 21, -4, 8, 1, 0, -9, -64])
  })
})
