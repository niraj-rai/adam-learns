import { describe, expect, it } from 'vitest'
import { electricPower, fuseFor, heat, ohm, parallel, resistanceOfWire, series } from './circuits'

describe('Grade 10 circuits', () => {
  it("Ohm's law", () => {
    expect(ohm.current(12, 4)).toBe(3)
    expect(ohm.voltage(0.5, 20)).toBe(10)
  })
  it('series and parallel', () => {
    expect(series([2, 3, 5])).toBe(10)
    expect(parallel([6, 3])).toBeCloseTo(2)
    expect(parallel([10, 10])).toBeCloseTo(5)
  })
  it('resistivity, power and heating', () => {
    expect(resistanceOfWire(1.7e-8, 10, 1e-6)).toBeCloseTo(0.17)
    expect(electricPower(230, 5)).toBe(1150)
    expect(heat(2, 10, 60)).toBe(2400)
  })
  it('fuse choice', () => {
    expect(fuseFor(4.3)).toBe(5)
    expect(fuseFor(100)).toBeNull()
  })
})
