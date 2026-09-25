import { describe, expect, it } from 'vitest'
import { collapse, validChain } from './model'

describe('food web', () => {
  it('without deer, the tiger loses its only food; the leopard survives on langurs', () => {
    const c = collapse(['deer'])
    expect(c).toContain('tiger')
    expect(c).not.toContain('leopard')
  })
  it('removing grass and trees starves every animal', () => {
    expect(collapse(['grass', 'trees']).length).toBe(9)
  })
  it('without insects, frogs starve, then snakes; hornbills and eagles survive on other food', () => {
    const c = collapse(['insects'])
    expect(c).toEqual(expect.arrayContaining(['frog', 'snake']))
    expect(c).not.toContain('hornbill')
    expect(c).toContain('eagle')
  })
  it('checks food chains', () => {
    expect(validChain(['grass', 'insects', 'frog', 'snake', 'eagle'])).toBe(true)
    expect(validChain(['grass', 'tiger'])).toBe(false)
    expect(validChain(['deer', 'tiger'])).toBe(false)
  })
})
