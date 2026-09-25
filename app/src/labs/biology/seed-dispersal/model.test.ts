import { describe, expect, it } from 'vitest'
import { distance, PLACES } from './model'

describe('seed dispersal', () => {
  it('each place has a feature that carries seeds far', () => {
    for (const p of PLACES) expect(Math.max(...p.best.map((f) => distance(f, p.id)))).toBeGreaterThan(4)
  })
  it('a coconut husk travels far by water but not on a windy hill', () => {
    expect(distance('husk', 'river')).toBeGreaterThan(100)
    expect(distance('husk', 'hill')).toBeLessThan(distance('hairs', 'hill'))
  })
  it('a plain seed barely moves anywhere', () => {
    for (const p of PLACES) expect(distance('plain', p.id)).toBeLessThanOrEqual(1)
  })
})
