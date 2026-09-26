import { describe, expect, it } from 'vitest'
import { PROBLEMS } from './model'

describe('word problems', () => {
  it('each stated answer satisfies its equation', () => {
    for (const p of PROBLEMS) expect(p.check(p.value), p.story).toBe(true)
  })
})
