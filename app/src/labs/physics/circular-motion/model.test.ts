import { describe, expect, it } from 'vitest'
import { centripetalAccel, circularSpeed } from './model'

describe('circular motion', () => {
  it('speed and acceleration', () => {
    expect(circularSpeed(7, 22 / 7 * 2)).toBeCloseTo(7)
    expect(centripetalAccel(10, 5)).toBe(20)
  })
})
