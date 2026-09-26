import { describe, expect, it } from 'vitest'
import { canDivide, divide, isSolved, PUZZLES, removeC, removeX, show, solution } from './model'

describe('balance scale', () => {
  it('every puzzle has a whole-number answer', () => {
    expect(PUZZLES.map(solution)).toEqual([3, 4, 3, 4, 5, 5])
  })
  it('keeps the balance while solving 2x + 5 = x + 9', () => {
    let e = PUZZLES[1]
    e = removeX(e)
    for (let i = 0; i < 5; i++) e = removeC(e)
    expect(isSolved(e)).toBe(true)
    expect(show(e.R)).toBe('4')
    expect(canDivide({ L: { x: 3, c: 0 }, R: { x: 0, c: 9 } }, 3)).toBe(true)
    expect(divide({ L: { x: 3, c: 0 }, R: { x: 0, c: 9 } }, 3)).toEqual({ L: { x: 1, c: 0 }, R: { x: 0, c: 3 } })
  })
})
