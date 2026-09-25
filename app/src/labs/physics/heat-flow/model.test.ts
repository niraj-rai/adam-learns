import { describe, expect, it } from 'vitest'
import { CELLS, MATERIALS, stepRod } from './model'

const run = (alpha: number, seconds: number) => {
  let T = Array(CELLS).fill(25)
  for (let t = 0; t < seconds; t += 0.05) T = stepRod(T, alpha, 0.05, 80, 25)
  return T
}
const alpha = (id: string) => MATERIALS.find((m) => m.id === id)!.alpha

describe('heat conduction along a rod', () => {
  it('heat flows from the hot end towards the cold end', () => {
    const T = run(alpha('copper'), 2)
    for (let i = 1; i < CELLS; i++) expect(T[i]).toBeLessThanOrEqual(T[i - 1] + 1e-9)
  })
  it('no part gets hotter than the chai or colder than the room', () => {
    for (const v of run(alpha('silver'), 20)) {
      expect(v).toBeLessThanOrEqual(80 + 1e-9)
      expect(v).toBeGreaterThanOrEqual(25 - 1e-9)
    }
  })
  it('a copper handle heats up much faster than a steel or wooden one', () => {
    const copper = run(alpha('copper'), 15)[CELLS - 1]
    const steel = run(alpha('steel'), 15)[CELLS - 1]
    const wood = run(alpha('wood'), 15)[CELLS - 1]
    expect(copper).toBeGreaterThan(45)
    expect(steel).toBeLessThan(copper)
    expect(wood).toBeLessThan(26)
  })
})
