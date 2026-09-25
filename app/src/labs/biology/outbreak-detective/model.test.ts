import { describe, expect, it } from 'vitest'
import { countByWell, SOURCE } from './model'

describe('outbreak detective', () => {
  it('most cases are nearest to the contaminated well', () => {
    const c = countByWell()
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]
    expect(top).toBe(SOURCE)
    expect(c[SOURCE]).toBeGreaterThan(20)
  })
})
