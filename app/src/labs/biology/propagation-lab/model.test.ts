import { describe, expect, it } from 'vitest'
import { PLANTS, works } from './model'

describe('vegetative propagation', () => {
  it('each plant has at least one method that works', () => {
    for (const p of PLANTS) expect(p.works.length).toBeGreaterThan(0)
  })
  it('potato grows from its tuber eye, not a leaf; Bryophyllum grows from a leaf', () => {
    expect(works('potato', 'tuber')).toBe(true)
    expect(works('potato', 'leaf')).toBe(false)
    expect(works('bryophyllum', 'leaf')).toBe(true)
  })
})
