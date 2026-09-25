import { rng } from '../germ-spread/model'

export const WELLS = [
  { id: 'A', x: 60, y: 60 },
  { id: 'B', x: 230, y: 90 },
  { id: 'C', x: 120, y: 190 },
  { id: 'D', x: 260, y: 200 },
]
export const SOURCE = 'B'

/** Households with cholera cases. Most cluster around the contaminated well; a few are travellers or visitors. */
export function cases(n = 36) {
  const r = rng(424242)
  const src = WELLS.find((w) => w.id === SOURCE)!
  return Array.from({ length: n }, (_, i) => {
    if (i % 9 === 8) return { x: 20 + r() * 280, y: 20 + r() * 210 }
    const a = r() * Math.PI * 2
    const d = 8 + r() * 45
    return { x: src.x + Math.cos(a) * d, y: src.y + Math.sin(a) * d }
  })
}

export const nearestWell = (p: { x: number; y: number }) => WELLS.reduce((best, w) => (Math.hypot(w.x - p.x, w.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? w : best)).id

export function countByWell() {
  const c: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 }
  for (const p of cases()) c[nearestWell(p)]++
  return c
}
