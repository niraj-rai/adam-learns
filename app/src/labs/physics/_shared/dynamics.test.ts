import { describe, expect, it } from 'vitest'
import { accel, collide, gAtHeight, gravity, kineticEnergy, momentum, pushApart, resultant, stoppingForce, weight, withFriction } from './dynamics'

describe('dynamics', () => {
  it('adds forces along a line', () => {
    expect(resultant([30, -20])).toBe(10)
    expect(resultant([15, -15])).toBe(0)
  })

  it('static friction holds until the push beats it', () => {
    expect(withFriction(20, 30, 25, false)).toEqual({ friction: -20, net: 0, moves: false })
    expect(withFriction(40, 30, 25, false)).toEqual({ friction: -25, net: 15, moves: true })
    expect(withFriction(-40, 30, 25, false).net).toBe(-15)
  })

  it('F = ma and weight', () => {
    expect(accel(20, 4)).toBe(5)
    expect(weight(50)).toBeCloseTo(490)
    expect(weight(50, 1.6)).toBeCloseTo(80)
  })

  it('conserves momentum in every collision', () => {
    for (const e of [0, 0.5, 1]) {
      const { v1, v2 } = collide(2, 3, 1, -1, e)
      expect(momentum(2, v1) + momentum(1, v2)).toBeCloseTo(2 * 3 + 1 * -1)
    }
    // equal masses, elastic: velocities swap
    const s = collide(1, 4, 1, 0, 1)
    expect(s.v1).toBeCloseTo(0)
    expect(s.v2).toBeCloseTo(4)
    // sticky: common velocity
    const k = collide(2, 3, 1, 0, 0)
    expect(k.v1).toBeCloseTo(2)
    expect(k.v2).toBeCloseTo(2)
    // elastic keeps kinetic energy; sticky loses some
    const el = collide(2, 3, 1, 0, 1)
    expect(kineticEnergy(2, el.v1) + kineticEnergy(1, el.v2)).toBeCloseTo(kineticEnergy(2, 3))
    expect(kineticEnergy(3, 2)).toBeLessThan(kineticEnergy(2, 3))
  })

  it('push-apart: equal and opposite momentum', () => {
    const r = pushApart(40, 60, 120, 0.5)
    expect(40 * r.v1 + 60 * r.v2).toBeCloseTo(0)
    expect(r.v1).toBeCloseTo(-1.5)
    expect(r.v2).toBeCloseTo(1)
  })

  it('longer stopping time means a smaller force', () => {
    expect(stoppingForce(0.16, 30, 0.01)).toBeCloseTo(480)
    expect(stoppingForce(0.16, 30, 0.1)).toBeCloseTo(48)
  })

  it('gravitation and the inverse square law', () => {
    expect(gravity(5.97e24, 1, 6.371e6)).toBeCloseTo(9.81, 1)
    expect(gAtHeight(0)).toBeCloseTo(9.8)
    expect(gAtHeight(6371)).toBeCloseTo(9.8 / 4)
    expect(gAtHeight(400)).toBeCloseTo(8.69, 1)
  })
})
