import { describe, expect, it } from 'vitest'
import { elbowAngle, JOINTS, triceps } from './model'

describe('joints and muscles', () => {
  it('contracting the biceps bends the elbow; the triceps relaxes', () => {
    expect(elbowAngle(1)).toBeLessThan(elbowAngle(0))
    expect(triceps(1)).toBe(0)
  })
  it('the ball-and-socket joint moves most; fixed joints not at all', () => {
    const r = (id: string) => JOINTS.find((j) => j.id === id)!.range
    expect(r('ball')).toBeGreaterThan(r('hinge'))
    expect(r('fixed')).toBe(0)
  })
})
