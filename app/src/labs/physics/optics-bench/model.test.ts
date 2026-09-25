import { describe, expect, it } from 'vitest'
import { imageOf } from './model'

describe('image formation', () => {
  it('object at 2F of a convex lens: real, inverted, same size, at 2F', () => {
    const i = imageOf(20, 10)
    expect(i.v).toBeCloseTo(20)
    expect(i.real).toBe(true)
    expect(i.upright).toBe(false)
    expect(i.size).toBe('same size')
  })
  it('object far away: real, inverted, diminished, between F and 2F', () => {
    const i = imageOf(30, 10)
    expect(i.v).toBeCloseTo(15)
    expect(i.size).toBe('diminished')
  })
  it('object inside F: virtual, upright, magnified (a magnifying glass)', () => {
    const i = imageOf(5, 10)
    expect(i.real).toBe(false)
    expect(i.upright).toBe(true)
    expect(i.m).toBeCloseTo(2)
  })
  it('diverging element: always virtual, upright and diminished', () => {
    for (const u of [3, 10, 25, 60]) {
      const i = imageOf(u, -10)
      expect(i.real).toBe(false)
      expect(i.upright).toBe(true)
      expect(i.size).toBe('diminished')
    }
  })
  it('object at F: image at infinity', () => {
    expect(imageOf(10, 10).atInfinity).toBe(true)
  })
})
