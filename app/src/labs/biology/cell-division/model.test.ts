import { describe, expect, it } from 'vitest'
import { bacteriaAfter, cellsAfter, doublingsTo, HUMAN_CELLS } from './model'

describe('cell division', () => {
  it('one cell doubles to 2, 4, 8…', () => {
    expect(cellsAfter(3)).toBe(8)
    expect(cellsAfter(10)).toBe(1024)
  })
  it('bacteria dividing every 20 minutes become over 16 million in 8 hours', () => {
    expect(bacteriaAfter(8)).toBe(2 ** 24)
    expect(bacteriaAfter(8)).toBeGreaterThan(16_000_000)
  })
  it('about 45 doublings would make as many cells as a human body', () => {
    expect(doublingsTo(HUMAN_CELLS)).toBe(46)
    expect(cellsAfter(45)).toBeLessThan(HUMAN_CELLS)
  })
})
