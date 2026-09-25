export type Cell = '.' | '#' | 'T' | '/' | '\\' | '>' | '<' | '^' | 'v'
export type Level = { id: string; title: string; grid: string[]; mirrors: number; hint: string }

export const LEVELS: Level[] = [
  { id: 'l1', title: 'First bounce', grid: ['>....#..', '.....#..', '.....#..', '........', '..T.....', '........'], mirrors: 1, hint: 'A \\ mirror turns a beam travelling right so it goes down.' },
  { id: 'l2', title: 'Round the wall', grid: ['........', '.>....#.', '......#.', '..###.#.', '......#.', '.......T'], mirrors: 2, hint: 'Go down before the wall, then turn right along the bottom.' },
  { id: 'l3', title: 'Through the gap', grid: ['v.......', '........', '###.####', '........', '.#....#.', '.#...T#.'], mirrors: 3, hint: 'Find the gap in the wall. You’ll need to turn three times.' },
  { id: 'l4', title: 'Two birds, one beam', grid: ['.......v', '.T......', '........', '..#.....', '........', 'T..#...#'], mirrors: 2, hint: 'A beam can pass through a target and keep going.' },
  { id: 'l5', title: 'The decoy', grid: ['T......<', '........', '..#..#..', '........', '.\\....T.', '........'], mirrors: 3, hint: 'Not every mirror on the board is useful. The beam can hit a target from any side.' },
]

const DIRS: Record<string, [number, number]> = { '>': [1, 0], '<': [-1, 0], '^': [0, -1], v: [0, 1] }
export type Placement = Record<string, '/' | '\\'>
export const key = (x: number, y: number) => `${x},${y}`

/** Follow the laser across the grid. Returns the points where the beam turns or stops, and the targets it hits. */
export function trace(grid: string[], placed: Placement) {
  const H = grid.length
  const W = grid[0].length
  let x = 0
  let y = 0
  let dx = 0
  let dy = 0
  grid.forEach((row, yy) => [...row].forEach((c, xx) => { if (c in DIRS) { x = xx; y = yy; [dx, dy] = DIRS[c] } }))
  const points: [number, number][] = [[x, y]]
  const hit = new Set<string>()
  const seen = new Set<string>()
  for (;;) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) { points.push([nx, ny]); break }
    const c = (placed[key(nx, ny)] ?? grid[ny][nx]) as Cell
    if (c === '#' || c in DIRS) { points.push([nx - dx / 2, ny - dy / 2]); break }
    x = nx
    y = ny
    const state = `${x},${y},${dx},${dy}`
    if (seen.has(state)) { points.push([x, y]); break }
    seen.add(state)
    if (c === 'T') hit.add(key(x, y))
    if (c === '/') { [dx, dy] = [-dy, -dx]; points.push([x, y]) }
    else if (c === '\\') { [dx, dy] = [dy, dx]; points.push([x, y]) }
  }
  return { points, hit }
}

export const targetsOf = (grid: string[]) => grid.flatMap((row, y) => [...row].flatMap((c, x) => (c === 'T' ? [key(x, y)] : [])))

export const solved = (grid: string[], placed: Placement) => {
  const { hit } = trace(grid, placed)
  return targetsOf(grid).every((t) => hit.has(t))
}
