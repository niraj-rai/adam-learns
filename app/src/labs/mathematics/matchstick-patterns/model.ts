export type Pattern = { id: string; name: string; emoji: string; a: number; b: number; hint: string }
/** Matchsticks needed for n shapes in a row = a·n + b. */
export const PATTERNS: Pattern[] = [
  { id: 'squares', name: 'Row of squares', emoji: '🟦', a: 3, b: 1, hint: 'The first square needs 4 sticks; each new square shares a side, so it adds 3.' },
  { id: 'triangles', name: 'Row of triangles', emoji: '🔺', a: 2, b: 1, hint: 'Triangles alternate up and down, sharing sides: each new one adds 2 sticks.' },
  { id: 'hexagons', name: 'Row of hexagons', emoji: '⬡', a: 5, b: 1, hint: 'Each new hexagon shares one side with the previous one, so it adds 5.' },
  { id: 'ladders', name: 'Ladder', emoji: '🪜', a: 3, b: 2, hint: 'Each rung adds 1 rung and 2 side rails; the ladder also starts with 2 extra rails.' },
]
export const sticks = (p: Pattern, n: number) => p.a * n + p.b

type Pt = [number, number]
export type Edge = [Pt, Pt]
/** The matchsticks for n shapes, as unique line segments (shared sides counted once). */
export function edges(id: string, n: number): Edge[] {
  const polys: Pt[][] = []
  if (id === 'squares') for (let i = 0; i < n; i++) polys.push([[i, 0], [i + 1, 0], [i + 1, 1], [i, 1]])
  if (id === 'triangles') {
    const B = (k: number): Pt => [k, 0]
    const T = (k: number): Pt => [k + 0.5, Math.sqrt(3) / 2]
    for (let i = 0; i < n; i++) {
      const k = Math.floor(i / 2)
      polys.push(i % 2 === 0 ? [B(k), B(k + 1), T(k)] : [T(k), T(k + 1), B(k + 1)])
    }
  }
  if (id === 'hexagons') {
    const r = 0.6
    for (let i = 0; i < n; i++) {
      const cx = i * Math.sqrt(3) * r
      polys.push(Array.from({ length: 6 }, (_, k) => [cx + r * Math.cos(((90 + 60 * k) * Math.PI) / 180), r * Math.sin(((90 + 60 * k) * Math.PI) / 180)] as Pt))
    }
  }
  const seen = new Map<string, Edge>()
  const key = (p: Pt) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`
  for (const poly of polys)
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length]
      const k = [key(p), key(q)].sort().join('|')
      if (!seen.has(k)) seen.set(k, [p, q])
    })
  if (id === 'ladders') {
    const out: Edge[] = []
    for (let y = 0; y <= n; y++) out.push([[0, y], [0, y + 1]], [[1, y], [1, y + 1]])
    for (let j = 1; j <= n; j++) out.push([[0, j], [1, j]])
    return out
  }
  return [...seen.values()]
}
