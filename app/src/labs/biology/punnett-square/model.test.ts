import { describe, expect, it } from 'vitest'
import { cross } from './model'

describe('Punnett squares', () => {
  it('Tt × Tt gives 3 tall : 1 short', () => {
    const r = cross('Tt', 'Tt')
    expect(r.counts).toEqual({ TT: 1, Tt: 2, tt: 1 })
    expect(r.dominant).toBe(3)
  })
  it('TT × tt gives all Tt', () => {
    expect(cross('TT', 'tt').counts).toEqual({ Tt: 4 })
  })
  it('Tt × tt gives 1 : 1', () => {
    expect(cross('Tt', 'tt').dominant).toBe(2)
  })
})
