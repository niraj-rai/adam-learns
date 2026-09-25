import { describe, expect, it } from 'vitest'
import { score } from './model'

describe('healthy day', () => {
  it('a day meeting every goal scores 100', () => {
    expect(score({ sleep: 9.5, active: 1.5, screen: 1.5, junk: 0, fruitVeg: 5 }).points).toBe(100)
  })
  it('too little sleep and too much screen time are flagged', () => {
    const r = score({ sleep: 6, active: 0.5, screen: 5, junk: 3, fruitVeg: 1 })
    expect(r.points).toBe(0)
    expect(r.fix).toContain('sleep')
    expect(r.fix).toContain('screen')
  })
})
