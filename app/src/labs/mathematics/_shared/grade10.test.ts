import { describe, expect, it } from 'vitest'
import { quadratic } from './quadratic'
import { ratios, heightFromElevation, distanceFromAngle } from './trig'
import { groupedMean, groupedMedian, groupedMode, cumulative } from './grouped'
import { section, triangleArea } from './coord'

describe('grade 10 maths models', () => {
  it('solves quadratics', () => {
    expect(quadratic(1, -5, 6).roots).toEqual([2, 3])
    expect(quadratic(1, -4, 4)).toMatchObject({ D: 0, roots: [2], kind: 'two equal roots' })
    expect(quadratic(1, 0, 1).roots).toEqual([])
    expect(quadratic(2, -8, 6)).toMatchObject({ sum: 4, product: 3, vertex: { x: 2, y: -2 } })
  })
  it('gives trig ratios', () => {
    expect(ratios(30).sin).toBeCloseTo(0.5)
    expect(ratios(60).cos).toBeCloseTo(0.5)
    expect(ratios(45).tan).toBeCloseTo(1)
    expect(ratios(90).tan).toBe(Infinity)
    expect(heightFromElevation(30, 60)).toBeCloseTo(30 * Math.sqrt(3))
    expect(distanceFromAngle(10, 45)).toBeCloseTo(10)
  })
  it('does grouped statistics', () => {
    const cs = [{ lo: 0, hi: 10, f: 5 }, { lo: 10, hi: 20, f: 8 }, { lo: 20, hi: 30, f: 12 }, { lo: 30, hi: 40, f: 10 }, { lo: 40, hi: 50, f: 5 }]
    expect(groupedMean(cs)).toBeCloseTo((25 + 120 + 300 + 350 + 225) / 40)
    // n/2 = 20, cf before 20–30 = 13: 20 + (7/12)×10
    expect(groupedMedian(cs).median).toBeCloseTo(20 + (7 / 12) * 10)
    // f1 = 12, f0 = 8, f2 = 10: 20 + 4/6 × 10
    expect(groupedMode(cs).mode).toBeCloseTo(20 + (4 / 6) * 10)
    expect(cumulative(cs)).toEqual([5, 13, 25, 35, 40])
  })
  it('uses the section formula', () => {
    expect(section({ x: 1, y: 2 }, { x: 7, y: 8 }, 1, 2)).toEqual({ x: 3, y: 4 })
    expect(section({ x: -1, y: 7 }, { x: 4, y: -3 }, 2, 3)).toEqual({ x: 1, y: 3 })
    expect(triangleArea({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 })).toBe(6)
    expect(triangleArea({ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 })).toBe(0)
  })
})
