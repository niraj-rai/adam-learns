export const RANKS = ['Kingdom', 'Phylum / Division', 'Class', 'Order', 'Family', 'Genus', 'Species'] as const

export type Organism = { name: string; emoji: string; ranks: string[] } // ranks[6] = binomial name

export const ORGANISMS: Organism[] = [
  { name: 'Tiger', emoji: '🐅', ranks: ['Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Panthera', 'Panthera tigris'] },
  { name: 'Lion', emoji: '🦁', ranks: ['Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Panthera', 'Panthera leo'] },
  { name: 'Pet cat', emoji: '🐈', ranks: ['Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Felidae', 'Felis', 'Felis catus'] },
  { name: 'Dog', emoji: '🐕', ranks: ['Animalia', 'Chordata', 'Mammalia', 'Carnivora', 'Canidae', 'Canis', 'Canis familiaris'] },
  { name: 'Human', emoji: '🧒', ranks: ['Animalia', 'Chordata', 'Mammalia', 'Primates', 'Hominidae', 'Homo', 'Homo sapiens'] },
  { name: 'Indian peafowl', emoji: '🦚', ranks: ['Animalia', 'Chordata', 'Aves', 'Galliformes', 'Phasianidae', 'Pavo', 'Pavo cristatus'] },
  { name: 'Housefly', emoji: '🪰', ranks: ['Animalia', 'Arthropoda', 'Insecta', 'Diptera', 'Muscidae', 'Musca', 'Musca domestica'] },
  { name: 'Mango', emoji: '🥭', ranks: ['Plantae', 'Angiosperms', 'Dicots (Magnoliopsida)', 'Sapindales', 'Anacardiaceae', 'Mangifera', 'Mangifera indica'] },
  { name: 'Neem', emoji: '🌳', ranks: ['Plantae', 'Angiosperms', 'Dicots (Magnoliopsida)', 'Sapindales', 'Meliaceae', 'Azadirachta', 'Azadirachta indica'] },
  { name: 'Wheat', emoji: '🌾', ranks: ['Plantae', 'Angiosperms', 'Monocots (Liliopsida)', 'Poales', 'Poaceae', 'Triticum', 'Triticum aestivum'] },
  { name: 'Button mushroom', emoji: '🍄', ranks: ['Fungi', 'Basidiomycota', 'Agaricomycetes', 'Agaricales', 'Agaricaceae', 'Agaricus', 'Agaricus bisporus'] },
]

/** Index of the lowest rank two organisms share (−1 if not even the kingdom). */
export function sharedRank(a: Organism, b: Organism) {
  let i = -1
  while (i + 1 < RANKS.length && a.ranks[i + 1] === b.ranks[i + 1]) i++
  return i
}

/** Is a scientific name written correctly? Genus capitalised, species lower case, two words (italics shown separately). */
export const isBinomial = (s: string) => /^[A-Z][a-z]+ [a-z]+$/.test(s.trim())
