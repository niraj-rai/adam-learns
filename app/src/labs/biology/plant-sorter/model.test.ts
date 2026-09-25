import { describe, expect, it } from 'vitest'
import { PLANTS } from './model'

describe('plant patterns', () => {
  it('parallel veins go with fibrous roots, and reticulate veins with taproots (monocots vs dicots)', () => {
    for (const p of PLANTS) expect(p.venation === 'parallel').toBe(p.root === 'fibrous')
  })
  it('the collection includes every habit and both leaf types', () => {
    expect(new Set(PLANTS.map((p) => p.habit)).size).toBe(3)
    expect(new Set(PLANTS.map((p) => p.venation)).size).toBe(2)
  })
})
