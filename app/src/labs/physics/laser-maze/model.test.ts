import { describe, expect, it } from 'vitest'
import { key, LEVELS, type Placement, solved } from './model'

const SOLUTIONS: Record<string, Placement> = {
  l1: { [key(2, 0)]: '\\' },
  l2: { [key(5, 1)]: '\\', [key(5, 5)]: '\\' },
  l3: { [key(0, 1)]: '\\', [key(3, 1)]: '\\', [key(3, 5)]: '\\' },
  l4: { [key(0, 1)]: '/', [key(7, 1)]: '/' },
  l5: { [key(6, 0)]: '/', [key(0, 5)]: '\\', [key(6, 5)]: '/' },
}

function solvableWith(grid: string[], k: number): boolean {
  const empty: string[] = []
  grid.forEach((row, y) => [...row].forEach((c, x) => { if (c === '.') empty.push(key(x, y)) }))
  const rec = (start: number, left: number, placed: Placement): boolean => {
    if (solved(grid, placed)) return true
    if (left === 0) return false
    for (let i = start; i < empty.length; i++) {
      for (const m of ['/', '\\'] as const) {
        if (rec(i + 1, left - 1, { ...placed, [empty[i]]: m })) return true
      }
    }
    return false
  }
  return rec(0, k, {})
}

describe('laser maze', () => {
  for (const l of LEVELS) {
    it(`${l.id} is solvable with ${l.mirrors} mirrors`, () => {
      const sol = SOLUTIONS[l.id]
      expect(Object.keys(sol).length).toBeLessThanOrEqual(l.mirrors)
      expect(solved(l.grid, sol)).toBe(true)
    })
    it(`${l.id} cannot be solved with fewer mirrors`, () => {
      expect(solvableWith(l.grid, l.mirrors - 1)).toBe(false)
    })
  }
})
