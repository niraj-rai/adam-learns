import { describe, expect, it } from 'vitest'
import { SPECIMENS } from '../virtual-microscope/model'
import { SLIDES } from './model'

describe('mystery slides', () => {
  it('every slide has its answer among 4 different options and uses a real specimen', () => {
    for (const s of SLIDES) {
      expect(s.options).toContain(s.answer)
      expect(new Set(s.options).size).toBe(4)
      expect(SPECIMENS.some((x) => x.id === s.specimen)).toBe(true)
    }
  })
})
