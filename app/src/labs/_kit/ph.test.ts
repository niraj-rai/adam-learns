import { describe, expect, it } from 'vitest'
import { INDICATORS, SOLUTIONS, getIndicator, natureOf, titrationPH } from './ph'

describe('pH kit', () => {
  it('titration: starts at pH 1, is neutral exactly at the end point, basic after', () => {
    expect(titrationPH(0)).toBeCloseTo(1, 5)
    expect(titrationPH(50)).toBe(7)
    expect(titrationPH(49.9)).toBeLessThan(5)
    expect(titrationPH(50.1)).toBeGreaterThan(9)
    expect(titrationPH(100)).toBeGreaterThan(12)
  })

  it('litmus agrees with the acid/base classification of every solution', () => {
    const blue = getIndicator('blue-litmus')
    const red = getIndicator('red-litmus')
    for (const s of SOLUTIONS) {
      const n = natureOf(s.pH)
      expect(blue.colour(s.pH).label === 'turns red', s.id).toBe(n === 'acidic')
      expect(red.colour(s.pH).label === 'turns blue', s.id).toBe(n === 'basic')
    }
  })

  it('turmeric and phenolphthalein cannot tell acid from neutral', () => {
    for (const id of ['turmeric', 'phenolphthalein'] as const) {
      const ind = INDICATORS.find((i) => i.id === id)!
      expect(ind.colour(2).label).toBe(ind.colour(7).label)
      expect(ind.colour(12).label).not.toBe(ind.colour(7).label)
    }
  })

  it('mystery bottles: universal indicator separates all but water and salt water', () => {
    const ids = ['hcl', 'vinegar', 'water', 'salt', 'bakingsoda', 'naoh']
    const u = getIndicator('universal')
    const labels = ids.map((id) => u.colour(SOLUTIONS.find((s) => s.id === id)!.pH).label)
    expect(new Set(labels).size).toBe(5)
  })
})
