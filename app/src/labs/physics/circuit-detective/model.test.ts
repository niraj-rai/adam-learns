import { describe, expect, it } from 'vitest'
import { CASES, fixedParts, works } from './model'

describe('circuit detective cases', () => {
  for (const c of CASES) {
    it(`${c.id}: broken before, working after the fix`, () => {
      expect(works(c.parts)).toBe(false)
      expect(works(fixedParts(c))).toBe(true)
      expect(c.answer).toBeLessThan(c.options.length)
      expect(new Set(c.options).size).toBe(c.options.length)
    })
  }
})
