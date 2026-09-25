import { describe, expect, it } from 'vitest'
import { stepBox } from './model'

const run = (force: number, friction: number, seconds: number, v0 = 0) => {
  let v = v0
  for (let t = 0; t < seconds; t += 0.01) v = stepBox(v, force, friction, 20, 0.01)
  return v
}

describe('force playground', () => {
  it('balanced forces: a still box stays still', () => expect(run(0, 30, 2)).toBe(0))
  it('a small push is held by friction', () => expect(run(20, 30, 2)).toBe(0))
  it('a push bigger than friction speeds it up in that direction', () => {
    expect(run(50, 30, 2)).toBeGreaterThan(0)
    expect(run(-50, 30, 2)).toBeLessThan(0)
  })
  it('with no friction and no net force, a moving box keeps its speed', () => expect(run(0, 0, 2, 1.5)).toBeCloseTo(1.5, 10))
  it('friction stops a moving box without reversing it', () => expect(run(0, 30, 5, 1)).toBe(0))
})
