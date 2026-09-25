import { describe, expect, it } from 'vitest'
import { assess } from './model'

describe('balanced thali', () => {
  it('a thali with every group in the right amount is balanced', () => {
    expect(assess(['roti', 'rice', 'dal', 'palak', 'salad', 'guava', 'curd']).balanced).toBe(true)
  })
  it('a samosa-and-cola lunch is not balanced', () => {
    const r = assess(['samosa', 'jalebi', 'cola'])
    expect(r.balanced).toBe(false)
    expect(r.high).toContain('treat')
    expect(r.low).toContain('veg')
  })
  it('too much of one group is flagged', () => {
    expect(assess(['roti', 'rice', 'idli', 'rice', 'dal', 'palak', 'salad', 'guava', 'curd']).high).toContain('grains')
  })
})
