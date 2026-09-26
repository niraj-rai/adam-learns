import { describe, expect, it } from 'vitest'
import { angleAt, arcLength, brahmagupta, cone, cylinder, heron, isTriangle, sectorArea, sphere } from './geometry'

describe('geometry', () => {
  it('angles', () => {
    expect(angleAt({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90)
    expect(angleAt({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(180)
  })
  it("Heron's and Brahmagupta's formulas", () => {
    expect(heron(3, 4, 5)).toBeCloseTo(6)
    expect(heron(13, 14, 15)).toBeCloseTo(84)
    expect(isTriangle(1, 2, 5)).toBe(false)
    expect(brahmagupta(5, 5, 5, 5)).toBeCloseTo(25) // a square is cyclic
  })
  it('circles and solids', () => {
    expect(arcLength(7, 90)).toBeCloseTo(11)
    expect(sectorArea(7, 360)).toBeCloseTo(153.94, 1)
    expect(cone(3, 4)).toMatchObject({ l: 5 })
    // Archimedes: sphere = 2/3 of the cylinder that fits around it; cone = 1/3 of the cylinder
    expect(sphere(3).volume / cylinder(3, 6).volume).toBeCloseTo(2 / 3)
    expect(cone(3, 6).volume / cylinder(3, 6).volume).toBeCloseTo(1 / 3)
    expect(sphere(2).surface).toBeCloseTo(cylinder(2, 4).curved)
  })
})
