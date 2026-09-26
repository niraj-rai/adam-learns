import { describe, expect, it } from 'vitest'
import { accelFromTime, runTrial, timeToCross } from './model'

describe('second law trolley', () => {
  it('times and acceleration agree', () => {
    expect(timeToCross(1)).toBeCloseTo(2)
    expect(accelFromTime(2)).toBeCloseTo(1)
  })
  it('doubling force doubles a; doubling mass halves it', () => {
    const base = runTrial(4, 2).a
    expect(runTrial(8, 2).a).toBeCloseTo(2 * base)
    expect(runTrial(4, 4).a).toBeCloseTo(base / 2)
    expect(base).toBeCloseTo(2)
  })
})
