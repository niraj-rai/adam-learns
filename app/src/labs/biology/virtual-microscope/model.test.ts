import { describe, expect, it } from 'vitest'
import { blurFor, estimateCellSize, fieldOfView, totalMagnification } from './model'

describe('microscope maths', () => {
  it('total magnification = eyepiece × objective', () => {
    expect(totalMagnification(40)).toBe(400)
    expect(totalMagnification(4)).toBe(40)
  })
  it('the field of view shrinks as magnification rises', () => {
    expect(fieldOfView(40)).toBe(4500)
    expect(fieldOfView(400)).toBe(450)
    expect(fieldOfView(400)).toBeLessThan(fieldOfView(100))
  })
  it('if 18 onion cells span a 4500 µm field, each is about 250 µm long', () => {
    expect(estimateCellSize(4500, 18)).toBe(250)
  })
  it('the image is sharp only at the right focus', () => {
    expect(blurFor(42, 42)).toBe(0)
    expect(blurFor(60, 42)).toBeGreaterThan(5)
  })
})
