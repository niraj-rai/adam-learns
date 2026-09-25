export type Habit = 'herb' | 'shrub' | 'tree'
export type Plant = { id: string; name: string; emoji: string; habit: Habit; root: 'taproot' | 'fibrous'; venation: 'reticulate' | 'parallel'; note: string }

export const PLANTS: Plant[] = [
  { id: 'mango', name: 'Mango', emoji: '🥭', habit: 'tree', root: 'taproot', venation: 'reticulate', note: 'India’s national fruit.' },
  { id: 'neem', name: 'Neem', emoji: '🌳', habit: 'tree', root: 'taproot', venation: 'reticulate', note: 'Its twigs were used as toothbrushes.' },
  { id: 'coconut', name: 'Coconut palm', emoji: '🌴', habit: 'tree', root: 'fibrous', venation: 'parallel', note: 'A tree, but with fibrous roots and parallel veins, like grasses!' },
  { id: 'hibiscus', name: 'Hibiscus (gudhal)', emoji: '🌺', habit: 'shrub', root: 'taproot', venation: 'reticulate', note: 'Several woody stems from near the ground.' },
  { id: 'rose', name: 'Rose', emoji: '🌹', habit: 'shrub', root: 'taproot', venation: 'reticulate', note: 'A thorny shrub.' },
  { id: 'tulsi', name: 'Tulsi', emoji: '🌿', habit: 'shrub', root: 'taproot', venation: 'reticulate', note: 'A small, bushy, slightly woody plant.' },
  { id: 'mustard', name: 'Mustard (sarson)', emoji: '🌼', habit: 'herb', root: 'taproot', venation: 'reticulate', note: 'Soft green stem; fields of yellow flowers in Punjab.' },
  { id: 'coriander', name: 'Coriander (dhaniya)', emoji: '🌱', habit: 'herb', root: 'taproot', venation: 'reticulate', note: 'A soft-stemmed herb.' },
  { id: 'rice', name: 'Rice (paddy)', emoji: '🌾', habit: 'herb', root: 'fibrous', venation: 'parallel', note: 'A grass, like wheat and maize.' },
  { id: 'wheat', name: 'Wheat', emoji: '🌾', habit: 'herb', root: 'fibrous', venation: 'parallel', note: 'A grass: long, narrow leaves.' },
  { id: 'maize', name: 'Maize (makka)', emoji: '🌽', habit: 'herb', root: 'fibrous', venation: 'parallel', note: 'A tall grass with prop roots.' },
  { id: 'onion', name: 'Onion', emoji: '🧅', habit: 'herb', root: 'fibrous', venation: 'parallel', note: 'The bulb is made of swollen leaf bases.' },
]

export const HABIT_TEXT: Record<Habit, string> = {
  herb: 'Herb: short, with a soft green stem',
  shrub: 'Shrub: medium height, with several hard, woody stems branching near the base',
  tree: 'Tree: tall, with one thick, hard woody trunk that branches high up',
}
