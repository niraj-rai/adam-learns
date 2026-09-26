import { describe, expect, it } from 'vitest'
import { count, EVENTS } from './model'

describe('sample space', () => {
  it('counts favourable outcomes', () => {
    expect(EVENTS.map((e) => count(e.test))).toEqual([6, 6, 11, 6, 18, 15])
  })
})
