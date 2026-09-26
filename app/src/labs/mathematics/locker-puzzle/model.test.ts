import { describe, expect, it } from 'vitest'
import { openLockers } from './model'

describe('locker puzzle', () => {
  it('only perfect squares stay open', () => {
    expect(openLockers(100)).toEqual([1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
  })
  it('after two people, only odd lockers are open', () => {
    expect(openLockers(10, 2)).toEqual([1, 3, 5, 7, 9])
  })
})
