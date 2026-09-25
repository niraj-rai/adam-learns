import { describe, expect, it } from 'vitest'
import { pinholeImage, shadowHeight } from './model'

describe('shadows and pinholes', () => {
  it('moving the object closer to the light makes the shadow bigger', () => {
    expect(shadowHeight(10, 20, 100)).toBe(50)
    expect(shadowHeight(10, 50, 100)).toBe(20)
    expect(shadowHeight(10, 20, 100)).toBeGreaterThan(shadowHeight(10, 50, 100))
  })
  it('an object touching the screen casts a shadow of its own size', () => {
    expect(shadowHeight(10, 100, 100)).toBe(10)
  })
  it('a pinhole image of a distant tree is tiny', () => {
    expect(pinholeImage(10, 20, 0.2)).toBeCloseTo(0.1)
  })
})
