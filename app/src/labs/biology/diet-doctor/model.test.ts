import { describe, expect, it } from 'vitest'
import { CASES } from './model'

describe('diet doctor', () => {
  it('each case has its answer among four distinct options and some foods', () => {
    for (const c of CASES) {
      expect(c.options).toContain(c.answer)
      expect(new Set(c.options).size).toBe(4)
      expect(c.foods.length).toBeGreaterThan(1)
    }
  })
})
