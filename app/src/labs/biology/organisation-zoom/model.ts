export const LEVELS = ['Cell', 'Tissue', 'Organ', 'Organ system', 'Organism'] as const
export type Level = (typeof LEVELS)[number]

export const LADDERS: Record<'human' | 'plant', { level: Level; name: string; emoji: string; text: string }[]> = {
  human: [
    { level: 'Cell', name: 'Muscle cell', emoji: '🔬', text: 'A single long muscle cell that can contract.' },
    { level: 'Tissue', name: 'Muscle tissue', emoji: '🧵', text: 'Many similar muscle cells working together.' },
    { level: 'Organ', name: 'Stomach', emoji: '🫃', text: 'Muscle, lining and nerve tissues together, churning and digesting food.' },
    { level: 'Organ system', name: 'Digestive system', emoji: '🍽️', text: 'Mouth, food pipe, stomach, intestines, liver and more, working together to digest food.' },
    { level: 'Organism', name: 'You!', emoji: '🧒', text: 'All your organ systems working together keep you alive.' },
  ],
  plant: [
    { level: 'Cell', name: 'Palisade cell', emoji: '🔬', text: 'A column-shaped leaf cell packed with chloroplasts.' },
    { level: 'Tissue', name: 'Palisade tissue', emoji: '🧵', text: 'A layer of palisade cells near the top of the leaf.' },
    { level: 'Organ', name: 'Leaf', emoji: '🍃', text: 'Several tissues together making food by photosynthesis.' },
    { level: 'Organ system', name: 'Shoot system', emoji: '🌿', text: 'Stem, leaves, flowers and fruits above the ground.' },
    { level: 'Organism', name: 'Mango tree', emoji: '🥭', text: 'Root and shoot systems together make a whole plant.' },
  ],
}

export const SORT_ITEMS: { label: string; level: Level }[] = [
  { label: 'Nerve cell', level: 'Cell' },
  { label: 'Blood', level: 'Tissue' },
  { label: 'Heart', level: 'Organ' },
  { label: 'Circulatory system', level: 'Organ system' },
  { label: 'Tiger', level: 'Organism' },
  { label: 'Root hair cell', level: 'Cell' },
  { label: 'Lungs', level: 'Organ' },
  { label: 'Skeletal system', level: 'Organ system' },
  { label: 'Bone tissue', level: 'Tissue' },
  { label: 'Neem tree', level: 'Organism' },
]
