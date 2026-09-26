import { describe, expect, it } from 'vitest'
import { ANIMAL_TISSUES } from './model'

describe('tissue slides', () => {
  it('covers all four animal tissue types', () => {
    expect(new Set(ANIMAL_TISSUES.map((t) => t.type))).toEqual(new Set(['Epithelial', 'Connective', 'Muscular', 'Nervous']))
    expect(ANIMAL_TISSUES.filter((t) => t.type === 'Muscular')).toHaveLength(3)
  })
})
