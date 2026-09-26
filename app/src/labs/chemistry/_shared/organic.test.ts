import { describe, expect, it } from 'vitest'
import { hydrocarbon, organicName } from './organic'

describe('organic naming', () => {
  it('hydrocarbon formulae', () => {
    expect(hydrocarbon(1, 'alkane').formula).toBe('CH4')
    expect(hydrocarbon(3, 'alkane')).toMatchObject({ formula: 'C3H8', name: 'propane' })
    expect(hydrocarbon(2, 'alkene')).toMatchObject({ formula: 'C2H4', name: 'ethene' })
    expect(hydrocarbon(2, 'alkyne')).toMatchObject({ formula: 'C2H2', name: 'ethyne' })
  })
  it('functional group names', () => {
    expect(organicName(2, 'alcohol')).toBe('ethanol')
    expect(organicName(2, 'acid')).toBe('ethanoic acid')
    expect(organicName(3, 'ketone')).toBe('propanone')
    expect(organicName(2, 'ketone')).toBeNull()
    expect(organicName(1, 'aldehyde')).toBe('methanal')
    expect(organicName(1, 'chloro')).toBe('chloromethane')
  })
})
