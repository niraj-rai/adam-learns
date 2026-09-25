import { describe, expect, it } from 'vitest'
import { checkCell, NEEDS } from './model'

describe('cell builder', () => {
  it('plant cells have everything animal cells have, plus wall, chloroplasts and a large vacuole', () => {
    for (const o of NEEDS.animal) expect(NEEDS.plant).toContain(o)
    expect(NEEDS.plant.filter((o) => !NEEDS.animal.includes(o)).sort()).toEqual(['chloroplast', 'vacuole', 'wall'])
  })
  it('an animal cell with a cell wall is wrong', () => {
    const r = checkCell('animal', ['membrane', 'cytoplasm', 'nucleus', 'mitochondria', 'wall'])
    expect(r.complete).toBe(false)
    expect(r.wrong).toEqual(['wall'])
  })
  it('reports missing parts', () => {
    expect(checkCell('plant', ['membrane', 'nucleus']).missing).toContain('chloroplast')
  })
})
