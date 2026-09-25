import { describe, expect, it } from 'vitest'
import { effectiveK, HOT_CONTAINERS, COLD_CONTAINERS, minutesAbove, targetFor, tempAt } from './model'

const hot = (id: string) => HOT_CONTAINERS.find((c) => c.id === id)!

describe('cooling', () => {
  it('only the vacuum flask keeps chai above 60 °C for two hours', () => {
    for (const c of HOT_CONTAINERS) {
      const mins = minutesAbove(90, 28, effectiveK(c, true), 60)
      expect(mins >= 120).toBe(c.id === 'flask')
    }
  })
  it('a lid slows cooling', () => {
    expect(tempAt(90, 28, effectiveK(hot('steel'), true), 30)).toBeGreaterThan(tempAt(90, 28, effectiveK(hot('steel'), false), 30))
  })
  it('a matka cools water below room temperature; a plastic bottle does not', () => {
    const matka = COLD_CONTAINERS.find((c) => c.id === 'matka')!
    const plastic = COLD_CONTAINERS.find((c) => c.id === 'plastic')!
    expect(tempAt(32, targetFor(matka, 38), matka.k, 240)).toBeLessThan(32)
    expect(tempAt(32, targetFor(plastic, 38), plastic.k, 240)).toBeGreaterThan(36)
  })
})
