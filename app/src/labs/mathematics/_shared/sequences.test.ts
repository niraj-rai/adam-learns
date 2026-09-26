import { describe, expect, it } from 'vitest'
import { apSum, apTerm, gpSum, gpTerm, groupedMean, hanoi } from './sequences'

describe('sequences and grouped data', () => {
  it('arithmetic progressions', () => {
    expect(apTerm(3, 4, 10)).toBe(39)
    expect(apSum(1, 1, 100)).toBe(5050)
  })
  it('geometric progressions', () => {
    expect(gpTerm(2, 3, 4)).toBe(54)
    expect(gpSum(1, 2, 10)).toBe(1023)
    expect(gpSum(5, 1, 4)).toBe(20)
  })
  it('Tower of Hanoi', () => expect(hanoi(3)).toBe(7))
  it('grouped mean uses midpoints', () => {
    expect(groupedMean([{ lo: 0, hi: 10, f: 2 }, { lo: 10, hi: 20, f: 2 }])).toBe(10)
  })
})
