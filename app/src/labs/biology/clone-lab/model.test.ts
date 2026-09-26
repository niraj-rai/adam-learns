import { describe, expect, it } from 'vitest'
import { METHODS, afterFission, generations } from './model'

describe('clone lab', () => {
  it('binary fission doubles each generation', () => {
    expect(afterFission(0)).toBe(1)
    expect(afterFission(10)).toBe(1024)
    expect(generations(120, 20)).toBe(6)
  })
  it('has six methods', () => expect(METHODS).toHaveLength(6))
})
