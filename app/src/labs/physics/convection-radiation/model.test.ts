import { describe, expect, it } from 'vitest'
import { convectionVelocity, radiationStep, SURFACES } from './model'

const run = (absorb: number, lampOn: boolean, start: number, seconds: number) => {
  let t = start
  for (let s = 0; s < seconds; s += 0.1) t = radiationStep(t, absorb, lampOn, 0.1)
  return t
}
const a = (id: string) => SURFACES.find((s) => s.id === id)!.absorb

describe('radiation', () => {
  it('a black can warms fastest under the lamp, shiny foil slowest', () => {
    expect(run(a('black'), true, 25, 60)).toBeGreaterThan(run(a('white'), true, 25, 60))
    expect(run(a('white'), true, 25, 60)).toBeGreaterThan(run(a('foil'), true, 25, 60))
  })
  it('with the lamp off, a hot black can cools faster than a shiny one', () => {
    expect(run(a('black'), false, 60, 60)).toBeLessThan(run(a('foil'), false, 60, 60))
  })
})

describe('convection', () => {
  it('hot water rises in the middle and sinks at the sides', () => {
    expect(convectionVelocity(0.5, 0.5).vy).toBeGreaterThan(0)
    expect(convectionVelocity(0.05, 0.5).vy).toBeLessThan(0)
    expect(convectionVelocity(0.95, 0.5).vy).toBeLessThan(0)
  })
  it('at the top, water spreads outwards from the centre', () => {
    expect(convectionVelocity(0.3, 0.95).vx).toBeLessThan(0)
    expect(convectionVelocity(0.7, 0.95).vx).toBeGreaterThan(0)
  })
})
