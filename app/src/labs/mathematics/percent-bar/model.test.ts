import { describe, expect, it } from 'vitest'
import { change, percentOf } from './model'

describe('percentages', () => {
  it('finds percentages and changes', () => {
    expect(percentOf(20, 450)).toBe(90)
    expect(change(800, 1000)).toBe(25)
    expect(change(1000, 800)).toBe(-20)
  })
})
