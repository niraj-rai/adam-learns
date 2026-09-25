import { describe, expect, it } from 'vitest'
import { periodOf } from './model'

describe('pendulum', () => {
  it('a ~99 cm pendulum has a 2-second period (seconds pendulum)', () => {
    expect(periodOf(99.3)).toBeCloseTo(2, 2)
  })
  it('quadrupling the length doubles the period', () => {
    expect(periodOf(100) / periodOf(25)).toBeCloseTo(2, 5)
  })
})
