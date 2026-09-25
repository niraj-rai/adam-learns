import { describe, expect, it } from 'vitest'
import { MODES, ORGANISMS } from './model'

describe('modes of nutrition', () => {
  it('every mode has at least one example', () => {
    for (const m of Object.keys(MODES)) expect(ORGANISMS.some((o) => o.mode === m)).toBe(true)
  })
})
