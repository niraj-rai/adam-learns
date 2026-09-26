import { describe, expect, it } from 'vitest'
import { isCubeNet, SOLIDS, type Cell } from './model'

const shape = (rows: string[]) => rows.flatMap((row, r) => [...row].flatMap((ch, c) => (ch === '#' ? [[r, c] as Cell] : [])))

describe('cube nets', () => {
  it('recognises nets', () => {
    expect(isCubeNet(shape([' # ', '###', ' # ', ' # ']))).toBe(true) // cross
    expect(isCubeNet(shape(['##  ', ' ###', '   #']))).toBe(true) // a 2-3-1 net
    expect(isCubeNet(shape(['##  ', '####']))).toBe(false) // two flaps fold onto the same face
    expect(isCubeNet(shape(['###', '###']))).toBe(false)
    expect(isCubeNet(shape(['######']))).toBe(false)
    expect(isCubeNet(shape(['#   ', '####', '#   ']))).toBe(true)
    expect(isCubeNet(shape(['##  ', ' ## ', '  ##']))).toBe(true) // staircase
  })
  it('there are exactly 11 cube nets', () => {
    // enumerate all 6-cell polyominoes inside a 4 × 6 box, up to rotation and reflection
    const seen = new Set<string>()
    const canon = (cells: Cell[]) => {
      const forms: string[] = []
      for (let t = 0; t < 8; t++) {
        const m = cells.map(([r, c]) => { let [x, y] = [r, c]; if (t & 1) [x, y] = [y, x]; if (t & 2) x = -x; if (t & 4) y = -y; return [x, y] as Cell })
        const mr = Math.min(...m.map((p) => p[0]))
        const mc = Math.min(...m.map((p) => p[1]))
        forms.push(m.map(([r, c]) => `${r - mr},${c - mc}`).sort().join(';'))
      }
      return forms.sort()[0]
    }
    const grow = (cells: Cell[]) => {
      if (cells.length === 6) { if (isCubeNet(cells)) seen.add(canon(cells)); return }
      const keys = new Set(cells.map((c) => c.join()))
      for (const [r, c] of cells)
        for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n: Cell = [r + dr, c + dc]
          if (!keys.has(n.join()) && Math.abs(n[0]) < 6 && Math.abs(n[1]) < 6) grow([...cells, n])
        }
    }
    grow([[0, 0]])
    expect(seen.size).toBe(11)
  })
  it('Euler: F + V − E = 2', () => {
    for (const s of SOLIDS) expect(s.F + s.V - s.E).toBe(2)
  })
})
