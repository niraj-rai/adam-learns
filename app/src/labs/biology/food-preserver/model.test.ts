import { describe, expect, it } from 'vitest'
import { hoursToSpoil, METHODS } from './model'

const m = (id: string) => METHODS.find((x) => x.id === id)!

describe('food preservation', () => {
  it('cooked food left in a warm kitchen spoils within about 10 hours', () => {
    expect(hoursToSpoil(m('room'))).toBeLessThan(12)
  })
  it('the fridge makes food last several days', () => {
    expect(hoursToSpoil(m('fridge')) / 24).toBeGreaterThan(3)
  })
  it('boiling then refrigerating lasts longest of the non-drying methods', () => {
    expect(hoursToSpoil(m('boilfridge'))).toBeGreaterThan(hoursToSpoil(m('fridge')))
    expect(hoursToSpoil(m('boil'))).toBeGreaterThan(hoursToSpoil(m('room')))
  })
  it('salt, sugar and drying stop growth', () => {
    for (const id of ['salt', 'sugar', 'dry']) expect(hoursToSpoil(m(id))).toBe(Infinity)
  })
})
