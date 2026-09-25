import { describe, expect, it } from 'vitest'
import { allDesigns, BRIEFS, DEFAULT_DESIGN, meetsBrief } from './model'

describe('cool house briefs', () => {
  const designs = allDesigns()
  for (const b of BRIEFS) {
    it(`${b.id} can be solved, but not by most designs`, () => {
      const winners = designs.filter((d) => meetsBrief(d, b)).length
      expect(winners).toBeGreaterThan(0)
      expect(winners / designs.length).toBeLessThan(0.25)
    })
  }
  it('the starting design fails every brief', () => {
    for (const b of BRIEFS) expect(meetsBrief(DEFAULT_DESIGN, b)).toBe(false)
  })
  it('the budget brief needs a different design from the unlimited one in most cases', () => {
    const budgetWins = designs.filter((d) => meetsBrief(d, BRIEFS[1])).length
    const freeWins = designs.filter((d) => meetsBrief(d, BRIEFS[0])).length
    expect(budgetWins).toBeLessThan(freeWins)
  })
})
