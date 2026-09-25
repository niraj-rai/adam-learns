import { describe, expect, it } from 'vitest'
import { cToF, cToK, fToC, inRange, THERMOMETERS } from './model'

describe('temperature scales', () => {
  it('converts the fixed points of water', () => {
    expect(cToF(100)).toBe(212)
    expect(cToF(0)).toBe(32)
    expect(cToK(100)).toBe(373)
  })
  it('body temperature is about 98.6 °F', () => {
    expect(cToF(37)).toBeCloseTo(98.6)
    expect(fToC(98.6)).toBeCloseTo(37)
  })
  it('a clinical thermometer cannot measure boiling water', () => {
    const clinical = THERMOMETERS.find((t) => t.id === 'clinical')!
    expect(inRange(clinical, 100)).toBe(false)
    expect(inRange(clinical, 38.5)).toBe(true)
  })
})
