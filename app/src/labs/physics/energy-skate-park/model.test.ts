import { describe, expect, it } from 'vitest'
import { G_EARTH } from '../_shared/dynamics'
import { advance, startX, trackY } from './model'

const energy = (s: { x: number; u: number }) => G_EARTH * trackY(s.x) + 0.5 * s.u * s.u // per kg

describe('skate park', () => {
  it('starts at the chosen height', () => {
    expect(trackY(startX(3.2))).toBeCloseTo(3.2)
  })
  it('conserves energy without friction', () => {
    let s = { x: startX(4), u: 0 }
    const e0 = energy(s)
    let maxSpeed = 0
    for (let i = 0; i < 300; i++) { s = advance(s, 0, 0.01); maxSpeed = Math.max(maxSpeed, Math.abs(s.u)) }
    expect(energy(s)).toBeCloseTo(e0, 0)
    expect(maxSpeed).toBeCloseTo(Math.sqrt(2 * G_EARTH * 4), 0)
  })
  it('friction drains energy until the skater rests near the bottom', () => {
    let s = { x: startX(4), u: 0 }
    const e0 = energy(s)
    for (let i = 0; i < 6000; i++) s = advance(s, 0.1, 0.01)
    expect(energy(s)).toBeLessThan(e0 * 0.2)
    expect(Math.abs(s.u)).toBeLessThan(0.05)
  })
})
