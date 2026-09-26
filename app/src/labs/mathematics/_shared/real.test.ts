import { describe, expect, it } from 'vitest'
import { decimalString, longDivision, recurringToFraction, simplifySurd, terminates } from './real'

describe('real numbers', () => {
  it('long division finds terminating and recurring decimals', () => {
    expect(decimalString(1, 8)).toBe('0.125')
    expect(decimalString(1, 3)).toBe('0.(3)')
    expect(decimalString(1, 6)).toBe('0.1(6)')
    expect(decimalString(1, 7)).toBe('0.(142857)')
    expect(decimalString(22, 7)).toBe('3.(142857)')
    expect(longDivision(1, 7).remainders).toHaveLength(6)
  })
  it('terminates only for denominators of 2s and 5s', () => {
    expect(terminates(3, 40)).toBe(true)
    expect(terminates(1, 12)).toBe(false)
    expect(terminates(3, 12)).toBe(true) // 3/12 = 1/4
  })
  it('turns recurring decimals into fractions', () => {
    expect(recurringToFraction('', '3')).toEqual([1, 3])
    expect(recurringToFraction('', '47')).toEqual([47, 99])
    expect(recurringToFraction('1', '6')).toEqual([1, 6])
    expect(recurringToFraction('', '9')).toEqual([1, 1])
    expect(recurringToFraction('25', '')).toEqual([1, 4])
  })
  it('simplifies surds', () => {
    expect(simplifySurd(12)).toEqual([2, 3])
    expect(simplifySurd(72)).toEqual([6, 2])
    expect(simplifySurd(7)).toEqual([1, 7])
    expect(simplifySurd(49)).toEqual([7, 1])
  })
})
