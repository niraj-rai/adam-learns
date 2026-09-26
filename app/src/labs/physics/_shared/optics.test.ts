import { describe, expect, it } from 'vitest'
import { criticalAngle, hypermetropiaCorrection, lensImage, mirrorImage, myopiaCorrection, power, refract } from './optics'

describe('Grade 10 optics', () => {
  it('concave mirror: object at 2F gives a real, inverted, same-size image at 2F', () => {
    const r = mirrorImage(-30, -15)
    expect(r.v).toBeCloseTo(-30)
    expect(r.m).toBeCloseTo(-1)
    expect(r.real).toBe(true)
  })
  it('concave mirror: object inside F gives a virtual, upright, magnified image', () => {
    const r = mirrorImage(-10, -15)
    expect(r.v).toBeCloseTo(30)
    expect(r.m).toBeCloseTo(3)
    expect(r.real).toBe(false)
    expect(r.upright).toBe(true)
  })
  it('convex mirror always gives virtual, upright, diminished images', () => {
    const r = mirrorImage(-20, 20)
    expect(r.v).toBeCloseTo(10)
    expect(r.m).toBeCloseTo(0.5)
  })
  it('convex lens and power', () => {
    const r = lensImage(-30, 20)
    expect(r.v).toBeCloseTo(60)
    expect(r.m).toBeCloseTo(-2)
    expect(lensImage(-10, 20).upright).toBe(true)
    expect(power(0.5)).toBe(2)
    expect(power(-0.25)).toBe(-4)
  })
  it("Snell's law and total internal reflection", () => {
    expect(refract(1, 1.5, 30)).toBeCloseTo(19.47, 1)
    expect(refract(1.5, 1, 60)).toBeNull()
    expect(criticalAngle(1.5, 1)).toBeCloseTo(41.8, 1)
  })
  it('eye corrections', () => {
    expect(myopiaCorrection(2)).toBe(-0.5)
    expect(hypermetropiaCorrection(1)).toBeCloseTo(3)
  })
})
