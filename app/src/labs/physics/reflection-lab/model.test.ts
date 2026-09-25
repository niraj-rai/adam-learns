import { describe, expect, it } from 'vitest'
import { angleToNormal, reflect } from './model'

describe('law of reflection', () => {
  it('a ray straight down onto a flat mirror bounces straight back', () => {
    const r = reflect(0, -1, 0)
    expect(r.dx).toBeCloseTo(0)
    expect(r.dy).toBeCloseTo(1)
  })
  it('angle of incidence equals angle of reflection', () => {
    for (const deg of [10, 30, 45, 70]) {
      const t = (deg * Math.PI) / 180
      const inc = { dx: Math.sin(t), dy: -Math.cos(t) }
      const out = reflect(inc.dx, inc.dy, 0)
      expect(angleToNormal(inc.dx, inc.dy, 0)).toBeCloseTo(deg)
      expect(angleToNormal(out.dx, out.dy, 0)).toBeCloseTo(deg)
    }
  })
  it('a 45° mirror turns a horizontal ray through a right angle', () => {
    const r = reflect(1, 0, 45)
    expect(r.dx).toBeCloseTo(0)
    expect(Math.abs(r.dy)).toBeCloseTo(1)
  })
})
