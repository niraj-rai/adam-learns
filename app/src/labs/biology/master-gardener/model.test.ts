import { describe, expect, it } from 'vitest'
import { TASKS } from './model'

describe('master gardener', () => {
  it('each task has its answer among four distinct options', () => {
    for (const t of TASKS) {
      expect(t.options).toContain(t.answer)
      expect(new Set(t.options).size).toBe(4)
    }
  })
})
