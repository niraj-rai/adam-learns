import { describe, expect, it } from 'vitest'
import { WORLDS, jumpHeight, scaleReading } from './model'

describe('weight on worlds', () => {
  it('jumps higher where gravity is weaker', () => {
    const moon = WORLDS.find((w) => w.id === 'moon')!
    expect(jumpHeight(0.5, moon.g)).toBeCloseTo(3.06, 1)
    expect(jumpHeight(0.5, 9.8)).toBeCloseTo(0.5)
  })
  it('an Earth scale reads less on the Moon', () => {
    expect(scaleReading(60, 1.6)).toBeCloseTo(9.8, 1)
    expect(scaleReading(60, 9.8)).toBeCloseTo(60)
  })
})
