import { describe, expect, it } from 'vitest'
import { PARTS, pollinationType } from './model'

describe('flowers', () => {
  it('has male parts (anther, filament) and female parts (stigma, style, ovary, ovule)', () => {
    expect(PARTS.filter((p) => p.whorl.startsWith('male')).length).toBe(2)
    expect(PARTS.filter((p) => p.whorl.startsWith('female')).length).toBe(4)
  })
  it('pollen from another plant is cross-pollination', () => {
    expect(pollinationType({ from: 'A', to: 'B' })).toBe('cross')
    expect(pollinationType({ from: 'A', to: 'A' })).toBe('self')
  })
})
