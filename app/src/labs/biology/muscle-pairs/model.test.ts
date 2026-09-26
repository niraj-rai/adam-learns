import { describe, expect, it } from 'vitest'
import { bicepsContraction, boneScore } from './model'

describe('muscle pairs', () => {
  it('biceps contracts as the arm bends', () => {
    expect(bicepsContraction(180)).toBe(0)
    expect(bicepsContraction(30)).toBe(1)
  })
  it('healthy habits score high; poor habits score low', () => {
    expect(boneScore({ calciumMg: 1300, sunMinutes: 20, exerciseDays: 5 })).toBe(100)
    expect(boneScore({ calciumMg: 300, sunMinutes: 0, exerciseDays: 0 })).toBeLessThan(15)
  })
})
