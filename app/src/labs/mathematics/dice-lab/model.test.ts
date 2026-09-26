import { describe, expect, it } from 'vitest'
import { simulate, theory } from './model'

describe('dice lab', () => {
  it('theory', () => {
    const two = theory(6, 2)
    expect(two.get(7)).toBeCloseTo(6 / 36)
    expect(two.get(2)).toBeCloseTo(1 / 36)
    expect([...two.values()].reduce((a, b) => a + b, 0)).toBeCloseTo(1)
  })
  it('experiment gets close to theory with many rolls', () => {
    const c = simulate(60000, 6, 1, 42)
    for (let f = 1; f <= 6; f++) expect((c.get(f) ?? 0) / 60000).toBeCloseTo(1 / 6, 1)
  })
})
