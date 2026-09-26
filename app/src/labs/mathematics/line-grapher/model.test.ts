import { describe, expect, it } from 'vitest'
import { PRESETS, through, y } from './model'

describe('line grapher', () => {
  it('evaluates presets', () => {
    const t = PRESETS.find((p) => p.id === 'temp')!
    expect(y(t.m, t.c, 100)).toBe(212)
    expect(y(t.m, t.c, 37)).toBe(98.6)
    const tank = PRESETS.find((p) => p.id === 'tank')!
    expect(y(tank.m, tank.c, 10)).toBe(0)
  })
  it('finds the line through two points', () => {
    expect(through([1, 3], [3, 7])).toEqual({ m: 2, c: 1 })
  })
})
