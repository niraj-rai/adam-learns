import { describe, expect, it } from 'vitest'
import { eclipse, illuminated, phaseName } from './model'

describe('moon phases', () => {
  it('new moon is dark, full moon is fully lit, quarters are half lit', () => {
    expect(illuminated(0)).toBeCloseTo(0)
    expect(illuminated(29.53 / 2)).toBeCloseTo(1)
    expect(illuminated(29.53 / 4)).toBeCloseTo(0.5)
  })
  it('names the phases in order', () => {
    expect(phaseName(0)).toBe('New moon')
    expect(phaseName(3.5)).toBe('Waxing crescent')
    expect(phaseName(7.4)).toBe('First quarter')
    expect(phaseName(14.8)).toBe('Full moon')
    expect(phaseName(22.1)).toBe('Last quarter')
  })
  it('eclipses happen only at new or full moon AND near a node', () => {
    expect(eclipse(0, 3)).toBe('solar')
    expect(eclipse(14.8, -4)).toBe('lunar')
    expect(eclipse(14.8, 40)).toBe(null)
    expect(eclipse(7.4, 0)).toBe(null)
  })
})
