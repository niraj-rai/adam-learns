import { describe, expect, it } from 'vitest'
import { cuboidVolume, cylinderVolume, litres } from './model'

describe('volume', () => {
  it('works', () => {
    expect(cuboidVolume(10, 5, 4)).toBe(200)
    expect(litres(cuboidVolume(100, 50, 40))).toBe(200)
    expect(cylinderVolume(7, 10, 22 / 7)).toBeCloseTo(1540)
  })
})
