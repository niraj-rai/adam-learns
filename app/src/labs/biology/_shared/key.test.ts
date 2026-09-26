import { describe, expect, it } from 'vitest'
import { identify } from './key'
import { ANIMAL_KEY, ANIMAL_SPECIMENS, PLANT_KEY, PLANT_SPECIMENS } from './keys'

describe('dichotomous keys', () => {
  it('every plant specimen keys out to its group', () => {
    for (const s of PLANT_SPECIMENS) expect(identify(PLANT_KEY, s.answers).group, s.name).toBe(s.group)
  })
  it('every animal specimen keys out to its group', () => {
    for (const s of ANIMAL_SPECIMENS) expect(identify(ANIMAL_KEY, s.answers).group, s.name).toBe(s.group)
  })
  it('every branch of each key ends in a real group', () => {
    for (const key of [PLANT_KEY, ANIMAL_KEY]) {
      for (const n of Object.values(key.nodes)) for (const next of [n.yes, n.no]) expect(next in key.nodes || next in key.groups).toBe(true)
    }
  })
})
