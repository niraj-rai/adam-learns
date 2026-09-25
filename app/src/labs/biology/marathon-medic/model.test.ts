import { describe, expect, it } from 'vitest'
import { CHECKPOINTS } from './model'

describe('marathon medic', () => {
  it('each checkpoint has its answer among four distinct options', () => {
    for (const c of CHECKPOINTS) {
      expect(c.options).toContain(c.answer)
      expect(new Set(c.options).size).toBe(4)
    }
  })
  it('sweat lost only increases through the race', () => {
    for (let i = 1; i < CHECKPOINTS.length; i++) expect(CHECKPOINTS[i].sweatL).toBeGreaterThanOrEqual(CHECKPOINTS[i - 1].sweatL)
  })
})
