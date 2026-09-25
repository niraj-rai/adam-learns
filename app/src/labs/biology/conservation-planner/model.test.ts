import { describe, expect, it } from 'vitest'
import { evaluate, meets, type Use } from './model'

describe('conservation planner', () => {
  it('all mines earn most but destroy biodiversity; all forest is the reverse', () => {
    const mines = evaluate(Array(16).fill('mine') as Use[])
    const forest = evaluate(Array(16).fill('forest') as Use[])
    expect(mines.income).toBeGreaterThan(forest.income)
    expect(forest.bio).toBeGreaterThan(mines.bio)
    expect(meets(Array(16).fill('mine') as Use[])).toBe(false)
    expect(meets(Array(16).fill('forest') as Use[])).toBe(false)
  })
  it('a connected forest block with farms and a town can meet both targets', () => {
    const g: Use[] = ['forest', 'forest', 'forest', 'farm', 'forest', 'forest', 'corridor', 'farm', 'forest', 'forest', 'farm', 'town', 'farm', 'farm', 'town', 'mine']
    expect(meets(g)).toBe(true)
  })
})
