import { describe, expect, it } from 'vitest'
import { parallelogramArea, trapeziumArea, triangleArea } from './model'

describe('area formulas', () => {
  it('works', () => {
    expect([parallelogramArea(8, 5), triangleArea(10, 6), trapeziumArea(6, 10, 4)]).toEqual([40, 30, 32])
  })
})
