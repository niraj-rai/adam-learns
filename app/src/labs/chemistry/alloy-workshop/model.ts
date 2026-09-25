export type Metal = 'Fe' | 'Cu' | 'Au' | 'Sn'
export type Add = 'C' | 'Zn' | 'Sn' | 'Cr' | 'Ni' | 'Cu' | 'Ag' | 'Pb'

export const BASES: Record<Metal, { name: string; colour: string; hardness: number; rust: number; mp: number; adds: Add[] }> = {
  Fe: { name: 'Iron', colour: '#6b7280', hardness: 4, rust: 1, mp: 1538, adds: ['C', 'Cr', 'Ni'] },
  Cu: { name: 'Copper', colour: '#c2410c', hardness: 3, rust: 4, mp: 1085, adds: ['Zn', 'Sn'] },
  Au: { name: 'Gold', colour: '#eab308', hardness: 2, rust: 5, mp: 1064, adds: ['Cu', 'Ag'] },
  Sn: { name: 'Tin', colour: '#cbd5e1', hardness: 1, rust: 4, mp: 232, adds: ['Pb'] },
}
export const ADD_NAMES: Record<Add, string> = { C: 'Carbon', Zn: 'Zinc', Sn: 'Tin', Cr: 'Chromium', Ni: 'Nickel', Cu: 'Copper', Ag: 'Silver', Pb: 'Lead' }

export type Recipe = { name: string; base: Metal; needs: Partial<Record<Add, [number, number]>>; total?: [number, number]; colour: string; hardness: number; rust: number; mp: number; uses: string }
export const RECIPES: Recipe[] = [
  { name: 'Steel', base: 'Fe', needs: { C: [0.1, 2] }, colour: '#71717a', hardness: 8, rust: 1, mp: 1450, uses: 'Bridges, buildings, railway tracks, cars' },
  { name: 'Stainless steel', base: 'Fe', needs: { C: [0, 1.2], Cr: [10, 20], Ni: [5, 12] }, colour: '#d4d4d8', hardness: 8, rust: 5, mp: 1450, uses: 'Kitchen utensils, sinks, surgical tools' },
  { name: 'Brass', base: 'Cu', needs: { Zn: [20, 45] }, colour: '#ca8a04', hardness: 6, rust: 4, mp: 920, uses: 'Taps, diyas, musical instruments, locks' },
  { name: 'Bronze', base: 'Cu', needs: { Sn: [8, 25] }, colour: '#a16207', hardness: 7, rust: 5, mp: 950, uses: 'Statues (like Chola bronzes!), medals, bells' },
  { name: '22-carat gold', base: 'Au', needs: { Cu: [0, 8.9], Ag: [0, 8.9] }, total: [7.5, 8.9], colour: '#eab308', hardness: 4, rust: 5, mp: 1000, uses: 'Jewellery: harder than pure gold, so it keeps its shape' },
  { name: 'Solder', base: 'Sn', needs: { Pb: [30, 45] }, colour: '#9ca3af', hardness: 2, rust: 4, mp: 183, uses: 'Joining wires in electronics (melts at a low temperature)' },
]


/** Which real alloy (if any) a mix matches. Additions not in a recipe must be zero. */
export function matchAlloy(base: Metal, amounts: Partial<Record<Add, number>>): Recipe | undefined {
  const adds = BASES[base].adds
  const total = adds.reduce((a, k) => a + (amounts[k] ?? 0), 0)
  if (total <= 0) return undefined
  return RECIPES.find((r) => {
    if (r.base !== base) return false
    if (r.total && (total < r.total[0] || total > r.total[1])) return false
    return adds.every((k) => {
      const v = amounts[k] ?? 0
      const range = r.needs[k]
      return range ? v >= range[0] && v <= range[1] : v === 0
    })
  })
}
