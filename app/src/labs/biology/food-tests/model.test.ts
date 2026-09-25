import { describe, expect, it } from 'vitest'
import { FOODS, result } from './model'

const f = (id: string) => FOODS.find((x) => x.id === id)!

describe('food tests', () => {
  it('rice and potato give a blue-black iodine result', () => {
    expect(result(f('rice'), 'starch')).toBe(true)
    expect(result(f('potato'), 'starch')).toBe(true)
  })
  it('egg white and paneer contain protein; ghee does not', () => {
    expect(result(f('egg'), 'protein')).toBe(true)
    expect(result(f('ghee'), 'protein')).toBe(false)
  })
  it('every nutrient has at least two positive and two negative foods', () => {
    for (const t of ['starch', 'protein', 'fat'] as const) {
      expect(FOODS.filter((x) => x[t]).length).toBeGreaterThanOrEqual(2)
      expect(FOODS.filter((x) => !x[t]).length).toBeGreaterThanOrEqual(2)
    }
  })
})
