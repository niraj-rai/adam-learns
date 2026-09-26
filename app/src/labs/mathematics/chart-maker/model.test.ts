import { describe, expect, it } from 'vitest'
import { DATASETS, pieAngles } from './model'

describe('chart maker', () => {
  it('pie angles add to 360°', () => {
    expect(pieAngles([30, 90])).toEqual([90, 270])
    for (const d of DATASETS) expect(pieAngles(d.items.map((i) => i.v)).reduce((a, b) => a + b, 0)).toBeCloseTo(360)
    expect(DATASETS[0].items.reduce((s, i) => s + i.v, 0)).toBe(24)
    expect(DATASETS[1].items.reduce((s, i) => s + i.v, 0)).toBe(120)
  })
})
