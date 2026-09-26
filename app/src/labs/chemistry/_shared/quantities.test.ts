import { describe, expect, it } from 'vitest'
import { ANIONS, CATIONS, ionicFormula, makeWater, massByMass, molarMass, moles, parseFormula, particles, pretty, solubilityAt } from './quantities'

const ion = (list: typeof CATIONS, name: string) => list.find((x) => x.name === name)!

describe('chemistry quantities', () => {
  it('parses formulae', () => {
    expect(parseFormula('H2O')).toEqual({ H: 2, O: 1 })
    expect(parseFormula('Ca(OH)2')).toEqual({ Ca: 1, O: 2, H: 2 })
    expect(parseFormula('Al2(SO4)3')).toEqual({ Al: 2, S: 3, O: 12 })
    expect(() => parseFormula('Xy2')).toThrow()
  })
  it('molar masses', () => {
    expect(molarMass('H2O')).toBe(18)
    expect(molarMass('CO2')).toBe(44)
    expect(molarMass('NaCl')).toBe(58.5)
    expect(molarMass('CaCO3')).toBe(100)
    expect(molarMass('C6H12O6')).toBe(180)
  })
  it('the mole', () => {
    expect(moles(36, 18)).toBe(2)
    expect(particles(2)).toBeCloseTo(1.2044e24)
  })
  it('criss-cross formulae', () => {
    expect(ionicFormula(ion(CATIONS, 'Aluminium'), ion(ANIONS, 'Oxide')).formula).toBe('Al2O3')
    expect(ionicFormula(ion(CATIONS, 'Calcium'), ion(ANIONS, 'Hydroxide')).formula).toBe('Ca(OH)2')
    expect(ionicFormula(ion(CATIONS, 'Magnesium'), ion(ANIONS, 'Oxide')).formula).toBe('MgO')
    expect(ionicFormula(ion(CATIONS, 'Ammonium'), ion(ANIONS, 'Sulfate')).formula).toBe('(NH4)2SO4')
    expect(ionicFormula(ion(CATIONS, 'Aluminium'), ion(ANIONS, 'Sulfate')).formula).toBe('Al2(SO4)3')
    expect(pretty('Al2(SO4)3')).toBe('Al₂(SO₄)₃')
  })
  it('every ion pair gives a formula with a sensible molar mass', () => {
    for (const c of CATIONS) for (const a of ANIONS) expect(molarMass(ionicFormula(c, a).formula)).toBeGreaterThan(0)
  })
  it('concentration and solubility', () => {
    expect(massByMass(20, 80)).toBe(20)
    expect(solubilityAt('KNO3', 20)).toBe(32)
    expect(solubilityAt('KNO3', 25)).toBe(39)
  })
  it('water always forms in a 1 : 8 mass ratio', () => {
    expect(makeWater(2, 16)).toEqual({ water: 18, leftH: 0, leftO: 0 })
    expect(makeWater(4, 16)).toEqual({ water: 18, leftH: 2, leftO: 0 })
    expect(makeWater(1, 16)).toEqual({ water: 9, leftH: 0, leftO: 8 })
  })
})
