import { describe, expect, it } from 'vitest'
import { iceMelted, mixTemperature } from './model'

describe('heat mixer', () => {
  it('equal amounts mix to the average temperature', () => {
    expect(mixTemperature(100, 80, 100, 20)).toBe(50)
  })
  it('more water pulls the mix towards its own temperature', () => {
    expect(mixTemperature(300, 20, 100, 80)).toBe(35)
  })
  it('a bucket of warm water holds more heat than a cup of hot water', () => {
    expect(iceMelted(10000, 40)).toBeGreaterThan(iceMelted(200, 90) * 20)
  })
})
