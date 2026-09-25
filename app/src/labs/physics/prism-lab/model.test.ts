import { describe, expect, it } from 'vitest'
import { deviation, SPECTRUM, throughFilter } from './model'

describe('dispersion', () => {
  it('violet bends more than red', () => {
    const red = SPECTRUM.find((c) => c.name === 'Red')!
    const violet = SPECTRUM.find((c) => c.name === 'Violet')!
    expect(deviation(violet.n, 60)).toBeGreaterThan(deviation(red.n, 60))
  })
  it('the spectrum is in VIBGYOR order of bending', () => {
    for (let i = 1; i < SPECTRUM.length; i++) expect(SPECTRUM[i].n).toBeGreaterThan(SPECTRUM[i - 1].n)
  })
  it('a red filter blocks blue light', () => {
    expect(throughFilter('red')).not.toContain('Blue')
    expect(throughFilter('none')).toHaveLength(7)
  })
})
