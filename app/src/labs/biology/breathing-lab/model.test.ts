import { describe, expect, it } from 'vitest'
import { ACTIVITIES, airFlow, limewaterSeconds, litresPerMinute } from './model'

describe('breathing', () => {
  it('breathing rate rises with activity', () => {
    for (let i = 1; i < ACTIVITIES.length; i++) expect(ACTIVITIES[i].breaths).toBeGreaterThan(ACTIVITIES[i - 1].breaths)
  })
  it('pulling the diaphragm down draws air in', () => {
    expect(airFlow(0.2, 0.8)).toBe('in')
    expect(airFlow(0.8, 0.2)).toBe('out')
  })
  it('exhaled air turns limewater milky much faster', () => {
    expect(limewaterSeconds('exhaled')).toBeLessThan(limewaterSeconds('inhaled') / 10)
  })
  it('a runner moves many times more air than someone at rest', () => {
    expect(litresPerMinute(40)).toBeGreaterThan(5 * litresPerMinute(15))
  })
})
