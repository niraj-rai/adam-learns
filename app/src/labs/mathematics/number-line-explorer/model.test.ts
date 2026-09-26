import { describe, expect, it } from 'vitest'
import { expression, positions, STORIES } from './model'

describe('number line explorer', () => {
  it('subtracting a negative moves right', () => {
    expect(positions(-3, [{ op: '-', n: -4 }])).toEqual([-3, 1])
    expect(expression(-3, [{ op: '-', n: -4 }])).toBe('−3 − (−4)')
  })
  it('story answers', () => {
    expect(STORIES.map((s) => positions(s.start, s.steps).at(-1))).toEqual([5, -1, -7, 1, 15, -13])
  })
})
