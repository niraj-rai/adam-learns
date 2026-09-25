import { describe, expect, it } from 'vitest'
import { MICROBES, visibleWithLight } from './model'

describe('microbe zoo', () => {
  it('includes all five groups', () => {
    expect(new Set(MICROBES.map((m) => m.group)).size).toBe(5)
  })
  it('viruses are too small for a light microscope; everything else is visible', () => {
    for (const m of MICROBES) expect(visibleWithLight(m)).toBe(m.group !== 'Virus')
  })
  it('has both useful and harmful microbes', () => {
    expect(MICROBES.some((m) => m.role === 'useful')).toBe(true)
    expect(MICROBES.some((m) => m.role === 'harmful')).toBe(true)
  })
})
