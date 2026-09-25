import { describe, expect, it } from 'vitest'
import { CHALLENGES, checkChain, isSolved } from './model'

const c = (id: string) => CHALLENGES.find((x) => x.id === id)!

describe('energy chain', () => {
  it('accepts a valid chain and multiplies efficiencies', () => {
    const r = checkChain('light', ['solar', 'fan'])
    expect(r.ok).toBe(true)
    expect(r.output).toBe('kinetic')
    expect(r.useful).toBeCloseTo(0.14)
  })
  it('breaks where the energy forms do not match', () => {
    expect(checkChain('light', ['fan']).brokenAt).toBe(0)
    expect(checkChain('gravitational', ['fall', 'led']).brokenAt).toBe(1)
  })
  it('every challenge has a solution', () => {
    expect(isSolved(c('sun-fan'), ['solar', 'fan'])).toBe(true)
    expect(isSolved(c('dam-led'), ['fall', 'generator', 'led'])).toBe(true)
    expect(isSolved(c('coal-heater'), ['boiler', 'steam', 'generator', 'heater'])).toBe(true)
    expect(isSolved(c('idli-lamp'), ['muscles', 'dynamo', 'led'])).toBe(true)
    expect(isSolved(c('sun-cycle'), ['plant', 'muscles'])).toBe(true)
  })
  it('an empty chain or the wrong end device does not solve it', () => {
    expect(isSolved(c('sun-fan'), [])).toBe(false)
    expect(isSolved(c('idli-lamp'), ['battery', 'led'])).toBe(false)
  })
})
