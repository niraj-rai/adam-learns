import { describe, expect, it } from 'vitest'
import { closeEnough, depthFrom, echoTime, SEABED, WRECK } from './model'

describe('sonar', () => {
  it('echo time and depth convert both ways', () => {
    for (const d of SEABED) expect(depthFrom(echoTime(d))).toBeCloseTo(d)
  })
  it('the rounded echo time still gives an accepted depth', () => {
    for (const d of SEABED) expect(closeEnough(depthFrom(Number(echoTime(d).toFixed(3))), d)).toBe(true)
  })
  it('the wreck is the only spot shallower than both neighbours', () => {
    const bumps = SEABED.map((d, i) => i > 0 && i < SEABED.length - 1 && d < SEABED[i - 1] && d < SEABED[i + 1]).flatMap((b, i) => (b ? [i] : []))
    expect(bumps).toEqual([WRECK])
  })
})
