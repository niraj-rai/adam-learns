import { describe, expect, it } from 'vitest'
import { ISOTONIC, massChange, tonicity } from './model'

describe('osmosis', () => {
  it('gains mass in pure water, loses it in strong solutions, none at isotonic', () => {
    expect(massChange(0)).toBeGreaterThan(8)
    expect(massChange(1)).toBeLessThan(-15)
    expect(massChange(ISOTONIC)).toBeCloseTo(0)
  })
  it('mass change falls as concentration rises', () => {
    for (let c = 0; c < 1; c += 0.1) expect(massChange(c + 0.1)).toBeLessThan(massChange(c))
  })
  it('classifies solutions', () => {
    expect(tonicity(0)).toBe('hypotonic')
    expect(tonicity(0.3)).toBe('isotonic')
    expect(tonicity(0.8)).toBe('hypertonic')
  })
})
