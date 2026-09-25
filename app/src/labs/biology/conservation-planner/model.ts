export type Use = 'forest' | 'farm' | 'town' | 'mine' | 'corridor'
export const USES: Record<Use, { name: string; emoji: string; bio: number; income: number; colour: string }> = {
  forest: { name: 'Protected forest', emoji: '🌳', bio: 10, income: 1, colour: '#15803d' },
  corridor: { name: 'Wildlife corridor', emoji: '🦌', bio: 6, income: 1, colour: '#65a30d' },
  farm: { name: 'Farmland', emoji: '🌾', bio: 3, income: 5, colour: '#ca8a04' },
  town: { name: 'Town', emoji: '🏘️', bio: 1, income: 7, colour: '#64748b' },
  mine: { name: 'Mine', emoji: '⛏️', bio: 0, income: 10, colour: '#78350f' },
}

/** A 4×4 region. Forest patches that touch other forest or corridors are worth more (connected habitat). */
export function evaluate(grid: Use[]) {
  const W = 4
  let bio = 0
  let income = 0
  grid.forEach((u, i) => {
    income += USES[u].income
    let b = USES[u].bio
    if (u === 'forest') {
      const x = i % W
      const y = Math.floor(i / W)
      const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => {
        const nx = x + dx
        const ny = y + dy
        return nx >= 0 && ny >= 0 && nx < W && ny < W && ['forest', 'corridor'].includes(grid[ny * W + nx])
      }).length
      b += n * 2
    }
    if (u === 'mine') {
      const x = i % W
      const y = Math.floor(i / W)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && ny >= 0 && nx < W && ny < W && grid[ny * W + nx] === 'forest') b -= 4 // pollution harms neighbouring forest
      }
    }
    bio += b
  })
  return { bio, income }
}

export const TARGET = { bio: 110, income: 45 }
export const meets = (grid: Use[]) => {
  const e = evaluate(grid)
  return e.bio >= TARGET.bio && e.income >= TARGET.income
}
