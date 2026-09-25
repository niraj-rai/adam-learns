import { describe, expect, it } from 'vitest'
import { CHALLENGES, matchesTarget, positionAt } from './model'

describe('graph walker', () => {
  it('computes position along a programmed walk', () => {
    const walk = [{ action: 'walk' as const, seconds: 4 }, { action: 'stop' as const, seconds: 3 }, { action: 'run' as const, seconds: 2 }]
    expect(positionAt(walk, 2)).toBe(2)
    expect(positionAt(walk, 5)).toBe(4)
    expect(positionAt(walk, 9)).toBe(10)
  })

  it('every challenge matches itself and stays on the track', () => {
    for (const c of CHALLENGES) {
      expect(matchesTarget(c.target, c.target)).toBe(true)
      for (let t = 0; t <= 20; t += 0.5) {
        const x = positionAt(c.target, t)
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(20)
      }
    }
  })

  it('rejects a walk with the right total time but the wrong shape', () => {
    const target = CHALLENGES[1].target // walk 4, stop 3, run 2
    expect(matchesTarget([{ action: 'walk', seconds: 9 }], target)).toBe(false)
    expect(matchesTarget([{ action: 'walk', seconds: 2 }, { action: 'walk', seconds: 2 }, { action: 'stop', seconds: 3 }, { action: 'run', seconds: 2 }], target)).toBe(true)
  })
})
