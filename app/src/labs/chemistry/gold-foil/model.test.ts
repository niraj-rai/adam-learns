import { describe, expect, it } from 'vitest'
import { SPACING, classify, deflection } from './model'

describe('gold foil scattering', () => {
  it('matches the real experiment: most straight through, a few deflected, very few bounce back', () => {
    const n = 100_000
    const counts = { straight: 0, small: 0, back: 0 }
    for (let i = 0; i < n; i++) {
      const b = ((i + 0.5) / n) * (SPACING / 2) // evenly spread impact distances
      counts[classify(deflection(b))]++
    }
    expect(counts.straight / n).toBeGreaterThan(0.85)
    expect(counts.back / n).toBeGreaterThan(0)
    expect(counts.back / n).toBeLessThan(0.01)
    expect(counts.small).toBeGreaterThan(counts.back)
  })
})
