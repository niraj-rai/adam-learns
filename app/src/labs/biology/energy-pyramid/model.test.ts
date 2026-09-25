import { describe, expect, it } from 'vitest'
import { energyAt } from './model'

describe('energy pyramid', () => {
  it('producers capture 1% of sunlight and each level gets about 10% of the one below', () => {
    expect(energyAt(0)).toBe(10000)
    expect(energyAt(1)).toBeCloseTo(1000)
    expect(energyAt(4)).toBeCloseTo(1)
  })
})
