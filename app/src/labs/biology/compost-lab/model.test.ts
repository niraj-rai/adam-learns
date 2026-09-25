import { describe, expect, it } from 'vitest'
import { compostDays, smelly } from './model'

describe('composting', () => {
  it('a balanced, damp, turned bin is fastest', () => {
    const best = compostDays(40, 'damp', true)
    expect(best).toBeLessThanOrEqual(50)
    expect(compostDays(40, 'dry', true)).toBeGreaterThan(best * 2)
    expect(compostDays(40, 'damp', false)).toBeGreaterThan(best)
    expect(compostDays(95, 'damp', true)).toBeGreaterThan(best)
  })
  it('soggy bins that are never turned smell', () => {
    expect(smelly('soggy', false)).toBe(true)
    expect(smelly('damp', false)).toBe(false)
  })
})
