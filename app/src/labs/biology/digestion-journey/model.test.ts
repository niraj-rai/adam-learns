import { describe, expect, it } from 'vitest'
import { STAGES, starchLeft, totalHours, totalLengthM } from './model'

describe('digestion journey', () => {
  it('the gut is about 8–9 metres long and the journey takes more than a day', () => {
    expect(totalLengthM()).toBeGreaterThan(8)
    expect(totalLengthM()).toBeLessThan(10)
    expect(totalHours()).toBeGreaterThan(24)
  })
  it('the small intestine is the longest part and finishes digestion', () => {
    const small = STAGES.find((s) => s.id === 'small')!
    expect(Math.max(...STAGES.map((s) => s.lengthCm))).toBe(small.lengthCm)
    expect(small.starch + small.protein + small.fat).toBe(0)
  })
  it('saliva digests starch; plain water does not', () => {
    expect(starchLeft(10, true)).toBeLessThan(10)
    expect(starchLeft(10, false)).toBe(100)
  })
})
