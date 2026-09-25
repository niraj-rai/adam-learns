import { describe, expect, it } from 'vitest'
import { inUrine, urine } from './model'

describe('kidneys', () => {
  it('urine contains urea, water and salts but not glucose, proteins or cells', () => {
    expect(inUrine('urea')).toBe(true)
    expect(inUrine('water')).toBe(true)
    expect(inUrine('glucose')).toBe(false)
    expect(inUrine('protein')).toBe(false)
    expect(inUrine('cells')).toBe(false)
  })
  it('on a hot day with lots of sweating, urine is less and darker', () => {
    const cool = urine(2, 0.3)
    const hot = urine(2, 1.5)
    expect(hot.volume).toBeLessThan(cool.volume)
    expect(hot.colour).toBe('dark yellow')
  })
})
