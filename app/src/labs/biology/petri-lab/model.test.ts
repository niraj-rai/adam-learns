import { describe, expect, it } from 'vitest'
import { HANDS, zoneFor } from './model'

describe('petri dish', () => {
  it('the control disc has no clear zone; the antibiotic has the biggest', () => {
    expect(zoneFor('water', false)).toBe(0)
    expect(zoneFor('antibiotic', false)).toBeGreaterThan(zoneFor('sanitiser', false))
  })
  it('resistant bacteria are not stopped by the antibiotic, but soap still works', () => {
    expect(zoneFor('antibiotic', true)).toBe(0)
    expect(zoneFor('soap', true)).toBeGreaterThan(0)
  })
  it('washing with soap removes far more bacteria than rinsing', () => {
    const c = (id: string) => HANDS.find((h) => h.id === id)!.colonies
    expect(c('soap')).toBeLessThan(c('rinse') / 5)
  })
})
