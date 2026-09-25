import { describe, expect, it } from 'vitest'
import { lightMinutes, scaleModel } from './model'

describe('solar system scale', () => {
  it('with a football-sized Sun (22 cm), Earth is a peppercorn about 24 m away', () => {
    const earth = scaleModel(22).find((p) => p.id === 'earth')!
    expect(earth.distanceM).toBeCloseTo(23.6, 0)
    expect(earth.sizeMm).toBeCloseTo(2, 0)
  })
  it('sunlight takes about 8.3 minutes to reach Earth', () => {
    expect(lightMinutes(1)).toBeCloseTo(8.3, 1)
  })
})
