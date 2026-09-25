import { describe, expect, it } from 'vitest'
import { echoDistance, MEDIA, minEchoDistance, travelTime } from './model'

describe('sound travel', () => {
  it('sound is fastest in solids and cannot travel through a vacuum', () => {
    const s = Object.fromEntries(MEDIA.map((m) => [m.id, m.speed]))
    expect(s.steel).toBeGreaterThan(s.water)
    expect(s.water).toBeGreaterThan(s.air)
    expect(travelTime(100, s.vacuum)).toBe(Infinity)
  })
  it('an echo after 2 s means a cliff about 343 m away', () => {
    expect(echoDistance(2)).toBe(343)
  })
  it('you need to be at least about 17 m from a wall to hear an echo', () => {
    expect(minEchoDistance()).toBeCloseTo(17.15)
  })
})
