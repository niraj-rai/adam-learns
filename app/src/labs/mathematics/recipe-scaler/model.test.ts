import { describe, expect, it } from 'vitest'
import { RECIPE, scale } from './model'

describe('recipe scaler', () => {
  it('scales with the unitary method', () => {
    expect(RECIPE.items.map((i) => scale(i.qty, 4, 6))).toEqual([600, 600, 6, 12, 3, 6])
    expect(scale(8, 4, 3)).toBe(6)
  })
})
