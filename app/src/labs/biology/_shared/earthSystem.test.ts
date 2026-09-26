import { describe, expect, it } from 'vitest'
import { projectCO2, surfaceTemp, warmingFromCO2 } from './earthSystem'

describe('earth system models', () => {
  it('gives Earth about 15 °C with an atmosphere and about −18 °C without', () => {
    expect(surfaceTemp(0.3, 0.78)).toBeCloseTo(15, 0)
    expect(surfaceTemp(0.3, 0)).toBeCloseTo(-18.6, 0)
  })
  it('cools when the planet is more reflective', () => {
    expect(surfaceTemp(0.5, 0.78)).toBeLessThan(surfaceTemp(0.3, 0.78))
  })
  it('warms 3 °C per doubling of CO₂', () => {
    expect(warmingFromCO2(560)).toBeCloseTo(3)
    expect(warmingFromCO2(280)).toBeCloseTo(0)
  })
  it('projects rising CO₂ with steady emissions and falling CO₂ with net removal', () => {
    const steady = projectCO2(0)
    expect(steady.at(-1)!.year).toBe(2100)
    expect(steady.at(-1)!.ppm).toBeCloseTo(425 + 75 * (4.5 / 2.12), 0)
    const cut = projectCO2(-10, 3)
    expect(cut.at(-1)!.ppm).toBeLessThan(425)
  })
})
