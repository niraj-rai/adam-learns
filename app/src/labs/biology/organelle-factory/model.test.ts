import { describe, expect, it } from 'vitest'
import { ORGANELLES, visibleIn } from './model'

describe('organelle factory', () => {
  it('plant cells have everything; animal cells lack wall, chloroplasts and large vacuole', () => {
    expect(ORGANELLES.filter((o) => visibleIn(o, 'plant'))).toHaveLength(ORGANELLES.length)
    expect(ORGANELLES.filter((o) => !visibleIn(o, 'animal')).map((o) => o.id).sort()).toEqual(['chloroplast', 'vacuole', 'wall'])
  })
})
