/** Monohybrid cross with one gene, two alleles (upper case dominant). */
export type Genotype = string // e.g. 'Tt'

export function gametes(g: Genotype) {
  return [g[0], g[1]]
}

export function cross(a: Genotype, b: Genotype) {
  const grid = gametes(a).map((x) => gametes(b).map((y) => [x, y].sort((p, q) => (p === p.toUpperCase() ? -1 : 1) - (q === q.toUpperCase() ? -1 : 1)).join('')))
  const all = grid.flat()
  const counts: Record<string, number> = {}
  for (const g of all) counts[g] = (counts[g] ?? 0) + 1
  const dominant = all.filter((g) => g[0] === g[0].toUpperCase()).length
  return { grid, counts, dominant, recessive: 4 - dominant }
}

export const sexCross = () => cross('XX', 'XY')
