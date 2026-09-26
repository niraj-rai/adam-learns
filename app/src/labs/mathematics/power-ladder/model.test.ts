import { describe, expect, it } from 'vitest'
import { show } from '../_shared/fraction'
import { ladder } from './model'

describe('power ladder', () => {
  it('keeps dividing by the base past zero', () => {
    expect(ladder(2, 3, -3).map((r) => show(r.v))).toEqual(['8', '4', '2', '1', '1/2', '1/4', '1/8'])
    expect(show(ladder(10, 0, -2)[2].v)).toBe('1/100')
  })
})
