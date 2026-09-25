import { describe, expect, it } from 'vitest'
import { evaluate, twoBulbs } from './model'

describe('series circuits', () => {
  it('a cell, a closed switch and a bulb make a working circuit', () => {
    const r = evaluate([{ type: 'cell' }, { type: 'switch', closed: true }, { type: 'bulb' }])
    expect(r.reason).toBe('works')
    expect(r.bulb).toBeCloseTo(1)
  })
  it('an open switch, an insulator or a fused bulb breaks the circuit', () => {
    expect(evaluate([{ type: 'cell' }, { type: 'switch', closed: false }, { type: 'bulb' }]).reason).toBe('open-switch')
    expect(evaluate([{ type: 'cell' }, { type: 'material', id: 'plastic' }, { type: 'bulb' }]).reason).toBe('insulator')
    expect(evaluate([{ type: 'cell' }, { type: 'bulb', fused: true }]).reason).toBe('fused-bulb')
  })
  it('two cells make a bulb brighter; two bulbs in series make each dimmer', () => {
    expect(evaluate([{ type: 'cell' }, { type: 'cell' }, { type: 'bulb' }]).bulb).toBeGreaterThan(3)
    expect(evaluate([{ type: 'cell' }, { type: 'bulb' }, { type: 'bulb' }]).bulb).toBeLessThan(0.5)
  })
  it('opposing cells cancel', () => {
    expect(evaluate([{ type: 'cell' }, { type: 'cell', reversed: true }, { type: 'bulb' }]).reason).toBe('cells-cancel')
  })
  it('an LED needs the right direction and about 2 V', () => {
    expect(evaluate([{ type: 'cell' }, { type: 'led' }]).reason).toBe('led-needs-more-voltage')
    expect(evaluate([{ type: 'cell' }, { type: 'cell' }, { type: 'led' }]).ledOn).toBe(true)
    expect(evaluate([{ type: 'cell' }, { type: 'cell' }, { type: 'led', reversed: true }]).reason).toBe('led-reversed')
  })
  it('graphite conducts, but less well than copper', () => {
    const cu = evaluate([{ type: 'cell' }, { type: 'material', id: 'copper' }, { type: 'bulb' }]).bulb
    const c = evaluate([{ type: 'cell' }, { type: 'material', id: 'graphite' }, { type: 'bulb' }]).bulb
    expect(c).toBeGreaterThan(0)
    expect(c).toBeLessThan(cu)
  })
})

describe('series vs parallel', () => {
  it('parallel bulbs stay bright and keep working if one is removed', () => {
    expect(twoBulbs('parallel', 1)).toEqual([1, 1])
    expect(twoBulbs('parallel', 1, true)).toEqual([0, 1])
  })
  it('series bulbs are dimmer and both go out if one is removed', () => {
    expect(twoBulbs('series', 1)[0]).toBeCloseTo(0.25)
    expect(twoBulbs('series', 1, true)).toEqual([0, 0])
  })
})
