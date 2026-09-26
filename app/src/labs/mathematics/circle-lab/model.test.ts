import { describe, expect, it } from 'vitest'
import { circleArea, circumference, wedges } from './model'

describe('circles', () => {
  it('uses π', () => {
    expect(circumference(7, 22 / 7)).toBeCloseTo(44)
    expect(circleArea(7, 22 / 7)).toBeCloseTo(154)
    expect(circleArea(1)).toBeCloseTo(Math.PI)
  })
  it('wedges rearrange into roughly a πr by r shape', () => {
    const ws = wedges(32, 10)
    expect(ws).toHaveLength(32)
    const xs = ws.flat().map((p) => p[0])
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(Math.PI * 10)
    expect(Math.max(...xs) - Math.min(...xs)).toBeLessThan(Math.PI * 10 * 1.1)
  })
})
