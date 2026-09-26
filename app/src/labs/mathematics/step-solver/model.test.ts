import { describe, expect, it } from 'vitest'
import { show } from '../_shared/fraction'
import { isSolved, moves, PROBLEMS, solutionOf, text } from './model'

describe('step solver', () => {
  it('knows each answer', () => {
    expect(PROBLEMS.map((p) => show(solutionOf(p.eq)))).toEqual(['4', '5', '6', '6', '2', '12'])
  })
  it('always reaches the answer by taking the first suggested move', () => {
    for (const p of PROBLEMS) {
      let e = p.eq
      for (let i = 0; i < 6 && !isSolved(e); i++) e = moves(e)[0].apply(e)
      expect(isSolved(e), p.text).toBe(true)
      expect(show(solutionOf(e))).toBe(show(solutionOf(p.eq)))
    }
    expect(text(PROBLEMS[1].eq)).toBe('5x − 3 = 2x + 12')
    expect(text(PROBLEMS[3].eq)).toBe('x/3 + 4 = 6')
  })
})
