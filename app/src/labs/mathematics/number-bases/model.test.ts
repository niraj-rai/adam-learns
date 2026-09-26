import { describe, expect, it } from 'vitest'
import { fromDigits, fromRoman, toBase, toRoman } from './model'

describe('number bases', () => {
  it('converts between bases', () => {
    expect(toBase(13, 2)).toEqual([1, 1, 0, 1])
    expect(toBase(1729, 60)).toEqual([28, 49])
    expect(fromDigits([1, 1, 0, 1], 2)).toBe(13)
  })
  it('reads and writes Roman numerals', () => {
    expect(toRoman(2026)).toBe('MMXXVI')
    expect(toRoman(1947)).toBe('MCMXLVII')
    expect(fromRoman('mcmxlvii')).toBe(1947)
    expect(fromRoman('IIII')).toBeNull()
  })
})
