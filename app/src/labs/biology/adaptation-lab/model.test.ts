import { describe, expect, it } from 'vitest'
import { FEATURES, HABITATS, survives } from './model'

describe('adaptations', () => {
  it('every habitat has at least three helpful features to choose from', () => {
    for (const h of HABITATS) expect(FEATURES.filter((f) => f.helps.includes(h.id)).length).toBeGreaterThanOrEqual(3)
  })
  it('a camel-like design survives the desert but not the sea', () => {
    expect(survives(['hump', 'padfeet', 'lashes'], 'desert')).toBe(true)
    expect(survives(['hump', 'padfeet', 'lashes'], 'ocean')).toBe(false)
  })
})
