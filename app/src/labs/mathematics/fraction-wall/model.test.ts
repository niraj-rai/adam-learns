import { describe, expect, it } from 'vitest'
import { equivalentsOnWall } from './model'

describe('fraction wall', () => {
  it('finds equivalent fractions on the wall', () => {
    expect(equivalentsOnWall(1, 2)).toEqual([[2, 1], [4, 2], [6, 3], [8, 4], [10, 5], [12, 6]])
    expect(equivalentsOnWall(2, 3)).toEqual([[3, 2], [6, 4], [12, 8]])
  })
})
