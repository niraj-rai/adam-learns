import { describe, expect, it } from 'vitest'
import { classHeights, groupData, tally } from './model'

describe('frequency builder', () => {
  it('groups every value exactly once', () => {
    const h = classHeights()
    expect(h).toHaveLength(40)
    for (const w of [2, 5, 10]) expect(groupData(h, w).reduce((s, b) => s + b.count, 0)).toBe(40)
    expect(groupData([10, 19, 20, 25], 10)).toEqual([{ from: 10, to: 20, count: 2 }, { from: 20, to: 30, count: 2 }])
  })
  it('draws tally marks', () => {
    expect(tally(7)).toEqual({ fives: 1, ones: 2 })
    expect(tally(3)).toEqual({ fives: 0, ones: 3 })
  })
})
