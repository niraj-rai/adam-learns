import { describe, expect, it } from 'vitest'
import { surfaceTempC, waterState } from './model'

describe('Goldilocks zone', () => {
  it('Earth with its atmosphere averages about 15 °C: liquid water', () => {
    const t = surfaceTempC(1, 0.3, 33)
    expect(t).toBeGreaterThan(10)
    expect(t).toBeLessThan(20)
    expect(waterState(t)).toBe('liquid water')
  })
  it('without the greenhouse effect, Earth would be frozen', () => {
    expect(waterState(surfaceTempC(1, 0.3, 0))).toBe('ice')
  })
  it('a Venus-like thick atmosphere makes a planet hotter than boiling', () => {
    expect(surfaceTempC(0.72, 0.75, 500)).toBeGreaterThan(400)
  })
  it('Mars is too far and too thin-aired to be warm', () => {
    expect(surfaceTempC(1.52, 0.25, 5)).toBeLessThan(-40)
  })
})
