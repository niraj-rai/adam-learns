import { describe, expect, it } from 'vitest'
import { angle, RELATIONS } from './model'

describe('angles with parallel lines', () => {
  it('each relation holds for any transversal angle', () => {
    for (const th of [30, 65, 90, 120]) {
      for (const r of RELATIONS)
        for (const [p, q] of r.pairs) {
          const a = angle(th, p.pos)
          const b = angle(th, q.pos)
          if (r.rule === 'equal') expect(a).toBe(b)
          else expect(a + b).toBe(180)
        }
    }
  })
})
