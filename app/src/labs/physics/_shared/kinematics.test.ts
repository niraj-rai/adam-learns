import { describe, expect, it } from 'vitest'
import { positionAt, solveSuvat, velocityAt } from './kinematics'

describe('kinematics', () => {
  it('v and s under constant acceleration', () => {
    expect(velocityAt(0, 2, 5)).toBe(10)
    expect(positionAt(0, 2, 5)).toBe(25)
  })
  it('solves any three knowns', () => {
    const metro = solveSuvat({ u: 20, v: 0, a: -1.25 })!
    expect(metro.t).toBe(16)
    expect(metro.s).toBe(160)
    const drop = solveSuvat({ u: 0, a: 9.8, s: 45 })!
    expect(drop.v).toBeCloseTo(29.7, 1)
    expect(drop.t).toBeCloseTo(3.03, 2)
    const car = solveSuvat({ u: 0, t: 10, s: 100 })!
    expect(car.a).toBe(2)
    expect(car.v).toBe(20)
    expect(solveSuvat({ u: 5, v: 0, a: 2 })).toBeNull() // speeding up can't reach 0: negative time
  })
})
