import { describe, expect, it } from 'vitest'
import { DISEASES } from './model'

describe('disease sorter', () => {
  it('non-communicable diseases never have an infectious route', () => {
    for (const d of DISEASES) expect(d.communicable).toBe(d.spread !== 'none')
  })
  it('covers every route', () => {
    for (const s of ['air', 'water', 'contact', 'vector', 'none']) expect(DISEASES.some((d) => d.spread === s)).toBe(true)
  })
})
