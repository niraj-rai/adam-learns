import { describe, expect, it } from 'vitest'
import { STORIES } from './model'

describe('graph stories', () => {
  it('each graph has a valid answer and time runs forwards', () => {
    for (const s of STORIES) {
      expect(s.answer).toBeLessThan(s.options.length)
      expect(s.pts.every((p, i) => i === 0 || p[0] > s.pts[i - 1][0])).toBe(true)
    }
    expect(new Set(STORIES.map((s) => s.answer)).size).toBeGreaterThan(2)
  })
})
