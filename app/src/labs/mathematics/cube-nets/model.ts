export type Cell = [number, number] // [row, col]
type Orient = { bottom: number; top: number; north: number; south: number; east: number; west: number }
const roll = (o: Orient, dir: 'N' | 'S' | 'E' | 'W'): Orient => {
  if (dir === 'E') return { ...o, bottom: o.east, east: o.top, top: o.west, west: o.bottom }
  if (dir === 'W') return { ...o, bottom: o.west, west: o.top, top: o.east, east: o.bottom }
  if (dir === 'N') return { ...o, bottom: o.north, north: o.top, top: o.south, south: o.bottom }
  return { ...o, bottom: o.south, south: o.top, top: o.north, north: o.bottom }
}
/**
 * Roll a cube across the squares, starting on the first one. Each square is the face touching the ground there.
 * The shape folds into a cube exactly when it has 6 connected squares and every square gets a different face.
 */
export function foldFaces(cells: Cell[]) {
  if (cells.length === 0) return null
  const key = (c: Cell) => `${c[0]},${c[1]}`
  const set = new Set(cells.map(key))
  const face = new Map<string, number>()
  const start: Orient = { bottom: 0, top: 1, north: 2, south: 3, east: 4, west: 5 }
  const queue: [Cell, Orient][] = [[cells[0], start]]
  face.set(key(cells[0]), 0)
  while (queue.length) {
    const [[r, c], o] = queue.shift()!
    for (const [dr, dc, dir] of [[-1, 0, 'N'], [1, 0, 'S'], [0, 1, 'E'], [0, -1, 'W']] as const) {
      const n: Cell = [r + dr, c + dc]
      if (!set.has(key(n)) || face.has(key(n))) continue
      const no = roll(o, dir)
      face.set(key(n), no.bottom)
      queue.push([n, no])
    }
  }
  return face
}
export function isCubeNet(cells: Cell[]) {
  if (cells.length !== 6) return false
  const f = foldFaces(cells)
  return !!f && f.size === 6 && new Set(f.values()).size === 6
}

export type Solid = { name: string; emoji: string; F: number; V: number; E: number }
export const SOLIDS: Solid[] = [
  { name: 'Cube', emoji: '🧊', F: 6, V: 8, E: 12 },
  { name: 'Tetrahedron (triangular pyramid)', emoji: '🔺', F: 4, V: 4, E: 6 },
  { name: 'Square pyramid', emoji: '🔼', F: 5, V: 5, E: 8 },
  { name: 'Triangular prism', emoji: '⛺', F: 5, V: 6, E: 9 },
  { name: 'Pentagonal prism', emoji: '⬟', F: 7, V: 10, E: 15 },
  { name: 'Octahedron', emoji: '💠', F: 8, V: 6, E: 12 },
  { name: 'Hexagonal pyramid', emoji: '⛰️', F: 7, V: 7, E: 12 },
]

/** A key that is the same for a shape and all its rotations and reflections. */
export function canon(cells: Cell[]) {
  const forms: string[] = []
  for (let t = 0; t < 8; t++) {
    const m = cells.map(([r, c]) => {
      let [x, y] = [r, c]
      if (t & 1) [x, y] = [y, x]
      if (t & 2) x = -x
      if (t & 4) y = -y
      return [x, y] as Cell
    })
    const mr = Math.min(...m.map((p) => p[0]))
    const mc = Math.min(...m.map((p) => p[1]))
    forms.push(m.map(([r, c]) => `${r - mr},${c - mc}`).sort().join(';'))
  }
  return forms.sort()[0]
}
