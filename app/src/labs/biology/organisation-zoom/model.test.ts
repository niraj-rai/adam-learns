import { describe, expect, it } from 'vitest'
import { LADDERS, LEVELS, SORT_ITEMS } from './model'

describe('levels of organisation', () => {
  it('each ladder climbs cell → tissue → organ → organ system → organism', () => {
    for (const k of ['human', 'plant'] as const) expect(LADDERS[k].map((s) => s.level)).toEqual([...LEVELS])
  })
  it('the sorting items cover every level twice', () => {
    for (const l of LEVELS) expect(SORT_ITEMS.filter((i) => i.level === l)).toHaveLength(2)
  })
})
