import { describe, expect, it } from 'vitest'
import { limitingFactor, rate, tempFactor } from './model'

describe('photosynthesis', () => {
  it('no light, no photosynthesis', () => {
    expect(rate(0, 80, 80, 30)).toBe(0)
  })
  it('the scarcest ingredient limits the rate', () => {
    expect(rate(30, 90, 90, 30)).toBe(30)
    expect(limitingFactor(30, 90, 90, 30)).toBe('light')
    expect(limitingFactor(90, 20, 90, 30)).toBe('carbon dioxide')
  })
  it('more light stops helping once CO₂ is limiting', () => {
    expect(rate(100, 40, 90, 30)).toBe(rate(60, 40, 90, 30))
  })
  it('best around 30 °C, stopped when very hot', () => {
    expect(tempFactor(30)).toBe(1)
    expect(tempFactor(50)).toBe(0)
    expect(limitingFactor(90, 90, 90, 8)).toBe('temperature')
  })
})
