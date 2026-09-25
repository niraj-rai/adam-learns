import { describe, expect, it } from 'vitest'
import { periscopeTrace, readsSameInMirror } from './model'

describe('plane mirrors', () => {
  it('finds words that read the same in a mirror', () => {
    expect(readsSameInMirror('MOM')).toBe(true)
    expect(readsSameInMirror('wow')).toBe(true)
    expect(readsSameInMirror('ADAM')).toBe(false)
    expect(readsSameInMirror('TOOT')).toBe(true)
    expect(readsSameInMirror('BOB')).toBe(false)
  })
  it('a periscope works only with both mirrors at 45°', () => {
    expect(periscopeTrace(45, 45).works).toBe(true)
    expect(periscopeTrace(30, 45).works).toBe(false)
    expect(periscopeTrace(45, 60).works).toBe(false)
    expect(periscopeTrace(135, 45).works).toBe(false)
  })
})
