import { describe, expect, it } from 'vitest'
import { MILESTONES, milestoneAt } from './model'

describe('pregnancy timeline', () => {
  it('milestones are in order and end at birth', () => {
    const w = MILESTONES.map((m) => m.week)
    expect([...w].sort((a, b) => a - b)).toEqual(w)
    expect(MILESTONES.at(-1)!.title).toBe('Birth')
  })
  it('finds the latest milestone reached', () => {
    expect(milestoneAt(13).title).toBe('All organs formed')
    expect(milestoneAt(0).title).toBe('Fertilisation')
  })
})
