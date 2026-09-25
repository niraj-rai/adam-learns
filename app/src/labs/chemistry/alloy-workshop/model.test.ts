import { describe, expect, it } from 'vitest'
import { matchAlloy } from './model'

describe('alloy workshop', () => {
  it('recognises every recipe with a typical mix', () => {
    expect(matchAlloy('Fe', { C: 0.5 })?.name).toBe('Steel')
    expect(matchAlloy('Fe', { C: 0.1, Cr: 18, Ni: 8 })?.name).toBe('Stainless steel')
    expect(matchAlloy('Cu', { Zn: 35 })?.name).toBe('Brass')
    expect(matchAlloy('Cu', { Sn: 12 })?.name).toBe('Bronze')
    expect(matchAlloy('Au', { Cu: 5, Ag: 3 })?.name).toBe('22-carat gold')
    expect(matchAlloy('Sn', { Pb: 37 })?.name).toBe('Solder')
  })

  it('does not match pure metals or wrong mixes', () => {
    expect(matchAlloy('Cu', {})).toBeUndefined()
    expect(matchAlloy('Cu', { Zn: 20, Sn: 10 })).toBeUndefined()
    expect(matchAlloy('Au', { Cu: 8, Ag: 8 })).toBeUndefined() // 16% additions ≈ 20 carat, not 22
    expect(matchAlloy('Fe', { C: 0.5, Cr: 2 })).toBeUndefined()
  })
})
