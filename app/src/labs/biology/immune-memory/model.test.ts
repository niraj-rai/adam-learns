import { describe, expect, it } from 'vitest'
import { antibodies, protectedBy } from './model'

describe('immune memory', () => {
  it('the second response is faster and much larger', () => {
    const peak = (second: boolean) => Math.max(...Array.from({ length: 30 }, (_, d) => antibodies(d, second)))
    const peakDay = (second: boolean) => Array.from({ length: 30 }, (_, d) => antibodies(d, second)).indexOf(peak(second))
    expect(peak(true)).toBeGreaterThan(3 * peak(false))
    expect(peakDay(true)).toBeLessThan(peakDay(false))
  })
  it('only the memory (second) response reaches protective levels', () => {
    expect(protectedBy(false)).toBe(false)
    expect(protectedBy(true)).toBe(true)
  })
})
