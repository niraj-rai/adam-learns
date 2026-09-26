import { describe, expect, it } from 'vitest'
import { indianCommas, indianWords, internationalCommas } from './words'

describe('number names', () => {
  it('reads numbers in the Indian system', () => {
    expect(indianWords(205030)).toBe('two lakh five thousand thirty')
    expect(indianWords(999999)).toBe('nine lakh ninety-nine thousand nine hundred ninety-nine')
    expect(indianWords(10000000)).toBe('one crore')
    expect(indianWords(17)).toBe('seventeen')
  })
  it('places commas', () => {
    expect(indianCommas(1234567)).toBe('12,34,567')
    expect(internationalCommas(1234567)).toBe('1,234,567')
  })
})
