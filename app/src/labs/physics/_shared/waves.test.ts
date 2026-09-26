import { describe, expect, it } from 'vitest'
import { LISTENERS, SPEED, band, canHear, distanceFromEcho, echoTime, minEchoDistance, period, waveSpeed, wavelength } from './waves'

describe('waves', () => {
  it('v = f λ', () => {
    expect(waveSpeed(440, 0.78)).toBeCloseTo(343.2)
    expect(wavelength(SPEED.air, 344)).toBe(1)
    expect(period(50)).toBe(0.02)
  })
  it('echoes', () => {
    expect(minEchoDistance()).toBeCloseTo(17.2)
    expect(echoTime(172)).toBeCloseTo(1)
    expect(distanceFromEcho(2, SPEED.seaWater)).toBeCloseTo(1531)
  })
  it('hearing ranges', () => {
    const human = LISTENERS.find((l) => l.name === 'Human')!
    const bat = LISTENERS.find((l) => l.name === 'Bat')!
    expect(canHear(human, 1000)).toBe(true)
    expect(canHear(human, 40000)).toBe(false)
    expect(canHear(bat, 40000)).toBe(true)
    expect(band(10)).toBe('infrasound')
    expect(band(30000)).toBe('ultrasound')
  })
})
