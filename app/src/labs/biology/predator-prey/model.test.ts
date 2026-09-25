import { describe, expect, it } from 'vitest'
import { healthy, runPlan } from './model'

describe('forest balance', () => {
  it('doing nothing lets poachers wipe out tigers; deer overgraze the grass', () => {
    const { pops } = runPlan(Array(10).fill('none'))
    expect(pops.tigers).toBeLessThan(1)
    expect(pops.grass).toBeLessThan(100)
    expect(healthy(pops)).toBe(false)
  })
  it('patrols, a corridor and relocating some deer restore balance', () => {
    const { pops } = runPlan(['patrol', 'patrol', 'corridor', 'relocate', 'none', 'none', 'none', 'none', 'none', 'none'])
    expect(healthy(pops)).toBe(true)
  })
  it('only removing deer, without tigers, does not work', () => {
    expect(healthy(runPlan(Array(10).fill('relocate')).pops)).toBe(false)
  })
})
