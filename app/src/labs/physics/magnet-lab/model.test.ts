import { describe, expect, it } from 'vitest'
import { barField, fieldLine } from './model'

describe('bar magnet field', () => {
  it('beyond the north pole, a compass points away from the magnet', () => {
    const b = barField(3, 0)
    expect(b.bx).toBeGreaterThan(0)
  })
  it('above the middle of the magnet, the field runs from N to S (towards −x)', () => {
    const b = barField(0, 1.5)
    expect(b.bx).toBeLessThan(0)
    expect(Math.abs(b.by)).toBeLessThan(1e-9)
  })
  it('field lines leave the N pole and end near the S pole', () => {
    const line = fieldLine(1, 0.12)
    const [x, y] = line[line.length - 1]
    expect(Math.hypot(x + 1, y)).toBeLessThan(0.2)
  })
})
