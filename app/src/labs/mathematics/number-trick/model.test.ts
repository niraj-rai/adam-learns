import { describe, expect, it } from 'vitest'
import { evaluate, format } from '../_shared/poly'
import { trace, TRICKS } from './model'

describe('number tricks', () => {
  it('always 5', () => {
    const t = trace(TRICKS[0])
    expect(format(t.at(-1)!)).toBe('5')
    expect(t.map((p) => evaluate(p, 7))).toEqual([7, 14, 24, 12, 5])
  })
  it('back to the start and age trick', () => {
    expect(format(trace(TRICKS[1]).at(-1)!)).toBe('x')
    expect(format(trace(TRICKS[2]).at(-1)!)).toBe('100x')
  })
})
