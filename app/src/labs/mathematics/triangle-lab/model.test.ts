import { describe, expect, it } from 'vitest'
import { canForm, classify, measure, roundTo180 } from './model'

describe('triangle lab', () => {
  it('angles always add to 180°', () => {
    for (const t of [[[0, 0], [4, 0], [0, 3]], [[0, 0], [10, 0], [3, 7]], [[1, 1], [6, 2], [2, 9]]] as [number, number][][]) {
      const m = measure(t as [[number, number], [number, number], [number, number]])
      expect(m.angles.reduce((a, b) => a + b, 0)).toBeCloseTo(180)
    }
  })
  it('classifies', () => {
    const m = measure([[0, 0], [4, 0], [0, 3]])
    expect(classify(m.angles, m.sides)).toEqual({ byAngle: 'right-angled', bySide: 'scalene' })
    const e = measure([[0, 0], [2, 0], [1, Math.sqrt(3)]])
    expect(classify(e.angles, e.sides).bySide).toBe('equilateral')
  })
  it('checks the triangle inequality', () => {
    expect([canForm(3, 4, 5), canForm(3, 4, 8), canForm(5, 5, 10)]).toEqual([true, false, false])
  })
  it('rounds angles to a 180° total', () => {
    expect(roundTo180([59.6, 46.6, 73.8])).toEqual([60, 46, 74])
    expect(roundTo180([60, 60, 60])).toEqual([60, 60, 60])
  })
})
