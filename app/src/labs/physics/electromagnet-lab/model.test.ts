import { describe, expect, it } from 'vitest'
import { clipsHeld, compassDeflection } from './model'

describe('electromagnets', () => {
  it('more turns or more current makes a stronger electromagnet', () => {
    expect(clipsHeld(100, 2, 'iron')).toBeGreaterThan(clipsHeld(50, 2, 'iron'))
    expect(clipsHeld(50, 3, 'iron')).toBeGreaterThan(clipsHeld(50, 1, 'iron'))
  })
  it('an iron core makes it far stronger; switching off drops everything', () => {
    expect(clipsHeld(60, 2, 'iron')).toBeGreaterThan(5 * Math.max(1, clipsHeld(60, 2, 'none')))
    expect(clipsHeld(60, 2, 'iron', false)).toBe(0)
  })
  it('reversing the current reverses the compass deflection', () => {
    expect(compassDeflection(2, false)).toBe(-compassDeflection(2, true))
    expect(compassDeflection(0, false)).toBe(0)
  })
})
