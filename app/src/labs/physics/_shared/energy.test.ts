import { describe, expect, it } from 'vitest'
import { efficiency, kWh, kineticEnergy, leverEffort, mechanicalAdvantage, potentialEnergy, power, pulleyEffort, rampEffort, speedFromDrop, velocityRatio, work } from './energy'

describe('energy', () => {
  it('work depends on the direction of the force', () => {
    expect(work(10, 5)).toBe(50)
    expect(work(10, 5, 'against')).toBe(-50)
    expect(work(10, 5, 'perpendicular')).toBe(0)
  })
  it('KE and PE', () => {
    expect(kineticEnergy(2, 3)).toBe(9)
    expect(kineticEnergy(2, 6)).toBe(4 * kineticEnergy(2, 3))
    expect(potentialEnergy(10, 2)).toBeCloseTo(196)
  })
  it('falling: PE turns into KE', () => {
    const v = speedFromDrop(5)
    expect(kineticEnergy(3, v)).toBeCloseTo(potentialEnergy(3, 5))
    expect(v).toBeCloseTo(9.9, 1)
  })
  it('power and kWh', () => {
    expect(power(3000, 10)).toBe(300)
    expect(kWh(1500, 2)).toBe(3)
  })
  it('machines', () => {
    expect(leverEffort(600, 0.5, 1.5)).toBeCloseTo(200)
    expect(mechanicalAdvantage(600, 200)).toBe(3)
    expect(velocityRatio(6, 2)).toBe(3)
    expect(pulleyEffort(400, 4)).toBe(100)
    expect(pulleyEffort(400, 4, 0.8)).toBe(125)
    expect(rampEffort(500, 1, 5)).toBe(100)
    expect(efficiency(400, 500)).toBe(0.8)
  })
})
