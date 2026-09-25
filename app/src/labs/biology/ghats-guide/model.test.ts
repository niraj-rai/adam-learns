import { describe, expect, it } from 'vitest'
import { identify, SPECIMENS } from './model'

describe('Western Ghats key', () => {
  it('every specimen leads to its own name', () => {
    for (const s of SPECIMENS) expect(identify(s.traits)).toBe(s.id)
  })
  it('all eight names are different', () => {
    expect(new Set(SPECIMENS.map((s) => identify(s.traits))).size).toBe(8)
  })
})
