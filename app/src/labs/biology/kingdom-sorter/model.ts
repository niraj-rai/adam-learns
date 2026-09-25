export const KINGDOMS = ['Animals', 'Plants', 'Fungi', 'Protists', 'Bacteria'] as const
export const CLASSES = ['Fish', 'Amphibians', 'Reptiles', 'Birds', 'Mammals'] as const

export type Living = { id: string; name: string; emoji: string; kingdom: (typeof KINGDOMS)[number]; vertebrateClass?: (typeof CLASSES)[number]; why: string }

export const LIVING: Living[] = [
  { id: 'tiger', name: 'Bengal tiger', emoji: '🐅', kingdom: 'Animals', vertebrateClass: 'Mammals', why: 'Fur, feeds its young on milk.' },
  { id: 'peacock', name: 'Indian peafowl', emoji: '🦚', kingdom: 'Animals', vertebrateClass: 'Birds', why: 'Feathers, beak, lays eggs with hard shells.' },
  { id: 'cobra', name: 'King cobra', emoji: '🐍', kingdom: 'Animals', vertebrateClass: 'Reptiles', why: 'Dry scaly skin, lays leathery eggs on land.' },
  { id: 'frog', name: 'Indian bullfrog', emoji: '🐸', kingdom: 'Animals', vertebrateClass: 'Amphibians', why: 'Moist skin; tadpoles live in water, adults on land and in water.' },
  { id: 'rohu', name: 'Rohu', emoji: '🐟', kingdom: 'Animals', vertebrateClass: 'Fish', why: 'Gills, fins, scales; lives in water.' },
  { id: 'dolphin', name: 'Ganges river dolphin', emoji: '🐬', kingdom: 'Animals', vertebrateClass: 'Mammals', why: 'Lives in water but breathes air with lungs and feeds its young on milk: a mammal, not a fish!' },
  { id: 'bat', name: 'Fruit bat', emoji: '🦇', kingdom: 'Animals', vertebrateClass: 'Mammals', why: 'Flies, but has fur and feeds its young on milk: a mammal.' },
  { id: 'earthworm', name: 'Earthworm', emoji: '🪱', kingdom: 'Animals', why: 'An invertebrate: no backbone.' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', kingdom: 'Animals', why: 'An invertebrate (insect): no backbone.' },
  { id: 'banyan', name: 'Banyan tree', emoji: '🌳', kingdom: 'Plants', why: 'Makes its own food by photosynthesis. India’s national tree.' },
  { id: 'lotus', name: 'Lotus', emoji: '🪷', kingdom: 'Plants', why: 'A flowering plant: India’s national flower.' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', kingdom: 'Fungi', why: 'Can’t make its own food; absorbs it from dead matter. Cell walls of chitin.' },
  { id: 'yeast', name: 'Yeast', emoji: '🍞', kingdom: 'Fungi', why: 'A single-celled fungus that makes dough rise.' },
  { id: 'amoeba', name: 'Amoeba', emoji: '🫧', kingdom: 'Protists', why: 'Single cell with a nucleus; lives in ponds.' },
  { id: 'lacto', name: 'Lactobacillus (curd bacteria)', emoji: '🥛', kingdom: 'Bacteria', why: 'Tiny single cells with no nucleus; turn milk into curd.' },
]
