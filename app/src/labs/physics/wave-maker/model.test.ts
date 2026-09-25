import { describe, expect, it } from 'vitest'
import { canHear, classify, logFreq, logPos, period } from './model'

describe('pitch and hearing', () => {
  it('humans hear 20 Hz to 20 kHz; bats and dogs hear ultrasound', () => {
    expect(canHear('human', 30000)).toBe(false)
    expect(canHear('dog', 30000)).toBe(true)
    expect(canHear('bat', 50000)).toBe(true)
    expect(canHear('elephant', 16)).toBe(true)
    expect(classify(10)).toBe('infrasound')
    expect(classify(40000)).toBe('ultrasound')
  })
  it('a 440 Hz note vibrates once every 1/440 s', () => {
    expect(period(440)).toBeCloseTo(0.00227, 5)
  })
  it('the log slider maps back and forth', () => {
    expect(logFreq(0)).toBe(20)
    expect(logFreq(1)).toBe(20000)
    expect(logFreq(logPos(440))).toBe(440)
  })
})
