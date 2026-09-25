import { describe, expect, it } from 'vitest'
import { germinationDay, seedlingColour, seedlingHeight } from './model'

describe('germination', () => {
  it('needs water, air and warmth', () => {
    expect(germinationDay({ water: 'moist', temp: 'warm', light: true })).not.toBeNull()
    expect(germinationDay({ water: 'dry', temp: 'warm', light: true })).toBeNull()
    expect(germinationDay({ water: 'flooded', temp: 'warm', light: true })).toBeNull()
    expect(germinationDay({ water: 'moist', temp: 'cold', light: true })).toBeNull()
  })
  it('light is not needed to germinate, but dark seedlings are tall and yellow', () => {
    const dark = { water: 'moist' as const, temp: 'warm' as const, light: false }
    expect(germinationDay(dark)).not.toBeNull()
    expect(seedlingColour(dark)).toBe('pale yellow')
    expect(seedlingHeight(dark, 7)).toBeGreaterThan(seedlingHeight({ ...dark, light: true }, 7))
  })
})
