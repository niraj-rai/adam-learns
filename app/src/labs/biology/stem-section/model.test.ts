import { describe, expect, it } from 'vitest'
import { TISSUES } from './model'

describe('stem section', () => {
  it('has meristematic, simple and complex tissues with unique clues', () => {
    expect(TISSUES.filter((t) => t.group === 'Meristematic')).toHaveLength(2)
    expect(TISSUES.filter((t) => t.group.includes('complex')).map((t) => t.id)).toEqual(['xylem', 'phloem'])
    expect(new Set(TISSUES.map((t) => t.clue)).size).toBe(TISSUES.length)
  })
})
