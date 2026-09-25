import { describe, expect, it } from 'vitest'
import { growthRate, MYTHS } from './model'

describe('growing up', () => {
  it('girls’ growth spurt tends to peak earlier than boys’', () => {
    const peakAge = (sex: 'girls' | 'boys') => {
      let best = 0
      let at = 0
      for (let a = 8; a <= 18; a += 0.5) if (growthRate(a, sex) > best) { best = growthRate(a, sex); at = a }
      return at
    }
    expect(peakAge('girls')).toBeLessThan(peakAge('boys'))
  })
  it('growth slows after the spurt', () => {
    expect(growthRate(17, 'girls')).toBeLessThan(growthRate(11.5, 'girls'))
  })
  it('has a mix of myths and facts', () => {
    expect(MYTHS.some((m) => m.fact)).toBe(true)
    expect(MYTHS.some((m) => !m.fact)).toBe(true)
  })
})
