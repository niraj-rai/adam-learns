import { describe, expect, it } from 'vitest'
import { ENZYMES, activity } from './model'

const e = (id: string) => ENZYMES.find((x) => x.id === id)!

describe('enzymes', () => {
  it('works best at the optimum', () => {
    expect(activity(e('amylase'), 37, 7)).toBeCloseTo(1)
    expect(activity(e('amylase'), 37, 2)).toBeLessThan(0.01)
    expect(activity(e('pepsin'), 37, 2)).toBeCloseTo(1)
  })
  it('slows in the cold and stops when denatured', () => {
    expect(activity(e('amylase'), 10, 7)).toBeLessThan(0.3)
    expect(activity(e('amylase'), 65, 7)).toBe(0)
  })
})
