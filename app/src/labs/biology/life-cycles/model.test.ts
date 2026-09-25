import { describe, expect, it } from 'vitest'
import { CYCLES, inOrder } from './model'

describe('life cycles', () => {
  it('recognises the correct frog sequence', () => {
    const f = CYCLES.find((c) => c.id === 'frog')!
    expect(inOrder('frog', f.stages)).toBe(true)
    expect(inOrder('frog', [...f.stages].reverse())).toBe(false)
  })
  it('only frog and silk moth undergo metamorphosis here', () => {
    expect(CYCLES.filter((c) => c.metamorphosis).map((c) => c.id).sort()).toEqual(['frog', 'silkworm'])
  })
  it('no stage names repeat within a cycle', () => {
    for (const c of CYCLES) expect(new Set(c.stages).size).toBe(c.stages.length)
  })
})
