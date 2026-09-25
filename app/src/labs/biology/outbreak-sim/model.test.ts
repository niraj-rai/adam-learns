import { describe, expect, it } from 'vitest'
import { herdThreshold, sir } from './model'

describe('outbreaks and herd immunity', () => {
  it('measles needs about 93% immunity; flu about 33%', () => {
    expect(herdThreshold(15)).toBeCloseTo(0.933, 2)
    expect(herdThreshold(1.5)).toBeCloseTo(0.333, 2)
  })
  it('with no vaccination, most of the town catches measles', () => {
    expect(sir(15, 0).everInfected).toBeGreaterThan(9000)
  })
  it('vaccinating above the threshold stops a big outbreak', () => {
    expect(sir(15, 0.95).everInfected).toBeLessThan(200)
    expect(sir(15, 0.8).everInfected).toBeGreaterThan(sir(15, 0.95).everInfected * 5)
  })
})
