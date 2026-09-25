export type Organism = { id: string; name: string; emoji: string; traits: Record<string, boolean> }
export type Question = { id: string; text: string }

export const QUESTIONS: Question[] = [
  { id: 'wings', text: 'Does it have wings?' },
  { id: 'legs6', text: 'Does it have six legs?' },
  { id: 'legs8', text: 'Does it have eight legs?' },
  { id: 'shell', text: 'Does it have a shell?' },
  { id: 'feathers', text: 'Does it have feathers?' },
  { id: 'fur', text: 'Does it have fur?' },
  { id: 'water', text: 'Does it live mainly in water?' },
  { id: 'legs', text: 'Does it have legs?' },
]

export const ORGANISMS: Organism[] = [
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', traits: { wings: true, legs6: true, legs8: false, shell: false, feathers: false, fur: false, water: false, legs: true } },
  { id: 'spider', name: 'Spider', emoji: '🕷️', traits: { wings: false, legs6: false, legs8: true, shell: false, feathers: false, fur: false, water: false, legs: true } },
  { id: 'snail', name: 'Snail', emoji: '🐌', traits: { wings: false, legs6: false, legs8: false, shell: true, feathers: false, fur: false, water: false, legs: false } },
  { id: 'sparrow', name: 'Sparrow', emoji: '🐦', traits: { wings: true, legs6: false, legs8: false, shell: false, feathers: true, fur: false, water: false, legs: true } },
  { id: 'squirrel', name: 'Squirrel', emoji: '🐿️', traits: { wings: false, legs6: false, legs8: false, shell: false, feathers: false, fur: true, water: false, legs: true } },
  { id: 'fish', name: 'Rohu fish', emoji: '🐟', traits: { wings: false, legs6: false, legs8: false, shell: false, feathers: false, fur: false, water: true, legs: false } },
  { id: 'ant', name: 'Ant', emoji: '🐜', traits: { wings: false, legs6: true, legs8: false, shell: false, feathers: false, fur: false, water: false, legs: true } },
  { id: 'crab', name: 'Crab', emoji: '🦀', traits: { wings: false, legs6: false, legs8: false, shell: true, feathers: false, fur: false, water: true, legs: true } },
]

/** Split a group with a yes/no question. A useful question must give two non-empty groups. */
export function split(group: string[], qid: string) {
  const yes = group.filter((id) => ORGANISMS.find((o) => o.id === id)!.traits[qid])
  const no = group.filter((id) => !yes.includes(id))
  return { yes, no, useful: yes.length > 0 && no.length > 0 }
}
