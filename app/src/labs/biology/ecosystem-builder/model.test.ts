import { describe, expect, it } from 'vitest'
import { ITEMS } from './model'

describe('ecosystem components', () => {
  it('includes at least two of each role', () => {
    for (const r of ['abiotic', 'producer', 'consumer', 'decomposer']) expect(ITEMS.filter((i) => i.role === r).length).toBeGreaterThanOrEqual(2)
  })
})
