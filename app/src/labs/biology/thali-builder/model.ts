export type Group = 'grains' | 'protein' | 'veg' | 'fruit' | 'dairy' | 'treat'

export const GROUPS: Record<Group, { name: string; emoji: string; target: [number, number]; why: string }> = {
  grains: { name: 'Cereals and millets', emoji: '🌾', target: [2, 3], why: 'Carbohydrates for energy' },
  protein: { name: 'Pulses, eggs, meat, fish, nuts', emoji: '🫘', target: [1, 2], why: 'Proteins for growth and repair' },
  veg: { name: 'Vegetables and greens', emoji: '🥬', target: [2, 3], why: 'Vitamins, minerals and fibre' },
  fruit: { name: 'Fruits', emoji: '🍊', target: [1, 2], why: 'Vitamins (like C), minerals and fibre' },
  dairy: { name: 'Milk, curd, paneer', emoji: '🥛', target: [1, 2], why: 'Protein and calcium for bones and teeth' },
  treat: { name: 'Fried food, sweets, sugary drinks', emoji: '🍩', target: [0, 1], why: 'Mostly fat and sugar: enjoy only a little' },
}

export const ITEMS: { id: string; name: string; emoji: string; group: Group }[] = [
  { id: 'roti', name: 'Ragi roti', emoji: '🫓', group: 'grains' },
  { id: 'rice', name: 'Rice', emoji: '🍚', group: 'grains' },
  { id: 'idli', name: 'Idli', emoji: '⚪', group: 'grains' },
  { id: 'dal', name: 'Dal', emoji: '🥣', group: 'protein' },
  { id: 'rajma', name: 'Rajma', emoji: '🫘', group: 'protein' },
  { id: 'egg', name: 'Egg curry', emoji: '🥚', group: 'protein' },
  { id: 'fish', name: 'Fish curry', emoji: '🐟', group: 'protein' },
  { id: 'palak', name: 'Palak sabzi', emoji: '🥬', group: 'veg' },
  { id: 'bhindi', name: 'Bhindi fry', emoji: '🫑', group: 'veg' },
  { id: 'salad', name: 'Carrot–cucumber salad', emoji: '🥕', group: 'veg' },
  { id: 'guava', name: 'Guava', emoji: '🍐', group: 'fruit' },
  { id: 'banana', name: 'Banana', emoji: '🍌', group: 'fruit' },
  { id: 'curd', name: 'Curd', emoji: '🥛', group: 'dairy' },
  { id: 'paneer', name: 'Paneer', emoji: '🧀', group: 'dairy' },
  { id: 'samosa', name: 'Samosa', emoji: '🥟', group: 'treat' },
  { id: 'jalebi', name: 'Jalebi', emoji: '🍥', group: 'treat' },
  { id: 'cola', name: 'Cola', emoji: '🥤', group: 'treat' },
]

export function countGroups(ids: string[]) {
  const c: Record<Group, number> = { grains: 0, protein: 0, veg: 0, fruit: 0, dairy: 0, treat: 0 }
  for (const id of ids) c[ITEMS.find((i) => i.id === id)!.group]++
  return c
}

/** A thali is balanced when every group is within its target range. */
export function assess(ids: string[]) {
  const c = countGroups(ids)
  const low = (Object.keys(GROUPS) as Group[]).filter((g) => c[g] < GROUPS[g].target[0])
  const high = (Object.keys(GROUPS) as Group[]).filter((g) => c[g] > GROUPS[g].target[1])
  return { counts: c, low, high, balanced: low.length === 0 && high.length === 0 }
}
