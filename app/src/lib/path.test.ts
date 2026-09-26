import { describe, expect, it } from 'vitest'
import { appSegments } from './path'

describe('appSegments', () => {
  it('works with and without the base path in the pathname', () => {
    expect(appSegments('/welcome', '/adam-learns/')).toEqual(['welcome'])
    expect(appSegments('/adam-learns/welcome', '/adam-learns/')).toEqual(['welcome'])
    expect(appSegments('/adam-learns', '/adam-learns/')).toEqual([])
    expect(appSegments('/labs/day-night', '/')).toEqual(['labs', 'day-night'])
    expect(appSegments('/', '/')).toEqual([])
  })
  it('does not strip a lookalike prefix', () => {
    expect(appSegments('/adam-learnsX/foo', '/adam-learns/')).toEqual(['adam-learnsX', 'foo'])
  })
})
