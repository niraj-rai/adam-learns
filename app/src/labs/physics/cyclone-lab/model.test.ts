import { describe, expect, it } from 'vitest'
import { categoryFor, cycloneModel } from './CycloneLab'

describe('cyclone lab', () => {
  it('uses IMD wind categories', () => {
    expect(categoryFor(25)).toMatch(/Low pressure/)
    expect(categoryFor(40)).toBe('Depression')
    expect(categoryFor(70)).toBe('Cyclonic storm')
    expect(categoryFor(150)).toBe('Very severe cyclonic storm')
    expect(categoryFor(250)).toBe('Super cyclonic storm')
  })
  it('a cool sea does not grow a storm; a warm sea does, and pressure falls as winds rise', () => {
    expect(cycloneModel(25, 7).wind).toBe(20)
    const a = cycloneModel(30, 2)
    const b = cycloneModel(30, 5)
    expect(b.wind).toBeGreaterThan(a.wind)
    expect(b.pressure).toBeLessThan(a.pressure)
  })
})
