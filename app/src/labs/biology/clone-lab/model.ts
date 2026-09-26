/** Number of organisms after n rounds of binary fission, starting from one. */
export const afterFission = (generations: number) => 2 ** generations

/** Generations in a given time, if one division takes `minutes`. */
export const generations = (totalMinutes: number, minutes: number) => Math.floor(totalMinutes / minutes)

export type Method = { id: string; name: string; emoji: string; example: string; how: string }
export const METHODS: Method[] = [
  { id: 'fission', name: 'Binary fission', emoji: '🦠', example: 'Amoeba, bacteria, Paramecium', how: 'The nucleus divides, then the cytoplasm splits into two identical daughter cells. (Plasmodium, the malaria parasite, splits into many at once: multiple fission.)' },
  { id: 'budding', name: 'Budding', emoji: '🌱', example: 'Hydra, yeast', how: 'A small outgrowth (bud) forms on the parent, grows, and breaks off as a new individual.' },
  { id: 'fragmentation', name: 'Fragmentation', emoji: '🧩', example: 'Spirogyra', how: 'The body breaks into pieces, and each piece grows into a complete new organism.' },
  { id: 'regeneration', name: 'Regeneration', emoji: '✂️', example: 'Planaria, Hydra', how: 'If cut into pieces, each piece can regrow all the missing parts using specialised cells.' },
  { id: 'spores', name: 'Spore formation', emoji: '🍞', example: 'Rhizopus (bread mould), ferns', how: 'Sporangia release thousands of tiny spores with tough coats; each can grow into a new organism in damp conditions.' },
  { id: 'vegetative', name: 'Vegetative propagation', emoji: '🥔', example: 'Potato (eyes), Bryophyllum (leaf buds), sugarcane, rose (cuttings)', how: 'A new plant grows from a root, stem or leaf of the parent, with no seeds.' },
]
