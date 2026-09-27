import { describe, expect, it } from 'vitest'
import { decodeSnapshot, encodeSnapshot, type Snapshot } from './snapshot'

const snap: Snapshot = {
  v: 1, n: 'Riya', g: 8, d: '2026-09-27', xp: 1250, st: 4, ad: 9, b: 12, due: 3,
  s: { physics: [10, 14, 53], chemistry: [8, 12, 45], biology: [5, 9, 55], mathematics: [20, 25, 69] },
  t: { to: 1800, wk: 9000, all: 86400, days: [0, 600, 1200, 0, 900, 1800, 2400, 0, 0, 600, 1200, 1500, 900, 1800], sub: { physics: 3000, mathematics: 6000 } },
  w: ['physics/motion/speed', 'chemistry/matter/density'],
  r: ['mathematics/algebra/factorisation'],
  ex: [['physics', 9, 'cbse', 18, 22, '2026-09-26']],
}

describe('shared progress snapshot', () => {
  it('round-trips through a compact link-safe string', async () => {
    const text = await encodeSnapshot(snap)
    expect(text).toMatch(/^[zj]\.[A-Za-z0-9_-]+$/)
    expect(text.length).toBeLessThan(700)
    expect(await decodeSnapshot(text)).toEqual(snap)
  })

  it('rejects damaged or unrelated text', async () => {
    expect(await decodeSnapshot('z.not-really')).toBeNull()
    expect(await decodeSnapshot('hello')).toBeNull()
    expect(await decodeSnapshot(`j.${btoa(JSON.stringify({ v: 2 }))}`)).toBeNull()
  })
})
