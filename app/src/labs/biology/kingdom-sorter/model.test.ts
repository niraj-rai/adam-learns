import { describe, expect, it } from 'vitest'
import { CLASSES, KINGDOMS, LIVING } from './model'

describe('kingdom sorter data', () => {
  it('uses every kingdom and every vertebrate class', () => {
    for (const k of KINGDOMS) expect(LIVING.some((l) => l.kingdom === k)).toBe(true)
    for (const c of CLASSES) expect(LIVING.some((l) => l.vertebrateClass === c)).toBe(true)
  })
  it('only animals can have a vertebrate class', () => {
    for (const l of LIVING) if (l.vertebrateClass) expect(l.kingdom).toBe('Animals')
  })
})
