import { describe as d, expect, it } from 'vitest'
import { SURFACES, describe, step } from './model'

const tiles = SURFACES.find((s) => s.id === 'tiles')!
const ice = SURFACES.find((s) => s.id === 'ice')!
const none = SURFACES.find((s) => s.id === 'none')!

d('force arena', () => {
  it('a small push on tiles does not move the crate', () => {
    expect(step(0, 20, tiles, 0.1)).toEqual({ v: 0, net: 0, friction: -20 })
  })
  it('a big push beats friction', () => {
    const r = step(0, 40, tiles, 0.1)
    expect(r.net).toBe(20)
    expect(r.v).toBeCloseTo(0.2)
  })
  it('without friction a moving crate keeps moving (first law)', () => {
    expect(step(2, 0, none, 1).v).toBe(2)
  })
  it('friction slows a sliding crate to rest but never reverses it', () => {
    let v = 1
    for (let i = 0; i < 200; i++) v = step(v, 0, tiles, 0.05).v
    expect(v).toBe(0)
    expect(step(3, 0, ice, 0.1).v).toBeCloseTo(2.99)
  })
  it('describes the motion', () => {
    expect(describe(0, 0)).toMatch(/balanced/)
    expect(describe(2, 0)).toMatch(/constant speed/)
    expect(describe(2, -5)).toMatch(/Slowing down/)
    expect(describe(0, 5)).toMatch(/Speeding up/)
  })
})
