import { describe, expect, it } from 'vitest'
import { averageInfected, transmission } from './model'

const none = { handwashing: false, masks: false, ventilation: false, stayHome: false }

describe('germ spread in a classroom', () => {
  it('each measure lowers the chance of passing germs on', () => {
    expect(transmission({ ...none, handwashing: true })).toBeLessThan(transmission(none))
    expect(transmission({ ...none, masks: true })).toBeLessThan(transmission(none))
  })
  it('on average, all measures together infect far fewer pupils than no measures', () => {
    const noMeasures = averageInfected(none)
    const all = averageInfected({ handwashing: true, masks: true, ventilation: true, stayHome: true })
    expect(all).toBeLessThan(noMeasures / 2)
  })
})
