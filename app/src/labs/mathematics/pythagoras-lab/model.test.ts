import { describe, expect, it } from 'vitest'
import { hyp, isRight, triples } from './model'

describe('Baudhayana–Pythagoras', () => {
  it('finds hypotenuses and triples', () => {
    expect(hyp(6, 8)).toBe(10)
    expect([isRight(5, 12, 13), isRight(13, 5, 12), isRight(4, 5, 6)]).toEqual([true, true, false])
    expect(triples(17)).toEqual([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15]])
  })
})
