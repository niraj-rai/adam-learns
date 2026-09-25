export const TRAITS = [
  { id: 'move', name: 'Movement', emoji: '🏃' },
  { id: 'resp', name: 'Respiration', emoji: '🫁' },
  { id: 'sense', name: 'Sensitivity (responds to changes)', emoji: '👀' },
  { id: 'grow', name: 'Growth', emoji: '📈' },
  { id: 'repro', name: 'Reproduction', emoji: '🐣' },
  { id: 'excrete', name: 'Excretion (removes wastes)', emoji: '🚽' },
  { id: 'nutri', name: 'Nutrition (needs food)', emoji: '🍽️' },
] as const
export type TraitId = (typeof TRAITS)[number]['id']

export type Thing = { id: string; name: string; emoji: string; traits: TraitId[]; note: string }

const ALL: TraitId[] = ['move', 'resp', 'sense', 'grow', 'repro', 'excrete', 'nutri']

export const THINGS: Thing[] = [
  { id: 'dog', name: 'A street dog', emoji: '🐕', traits: ALL, note: 'Shows all seven life processes.' },
  { id: 'neem', name: 'A neem tree', emoji: '🌳', traits: ALL, note: 'Plants move too: leaves turn to the light and flowers open and close, just slowly. They make their own food by photosynthesis.' },
  { id: 'seed', name: 'A dry bean seed', emoji: '🫘', traits: ALL, note: 'Alive but dormant (resting). It respires very slowly and grows into a new plant when conditions are right.' },
  { id: 'mushroom', name: 'A mushroom', emoji: '🍄', traits: ALL, note: 'A fungus: it is alive and absorbs food from dead matter.' },
  { id: 'car', name: 'A car', emoji: '🚗', traits: ['move', 'resp', 'excrete', 'nutri'], note: 'It moves, “burns” fuel with oxygen and gives out exhaust, but it cannot grow, reproduce or sense its surroundings by itself.' },
  { id: 'fire', name: 'A fire', emoji: '🔥', traits: ['move', 'resp', 'grow', 'nutri'], note: 'It spreads, grows and uses oxygen, but it has no cells, doesn’t sense or excrete, and doesn’t reproduce like living things.' },
  { id: 'crystal', name: 'A growing salt crystal', emoji: '🧂', traits: ['grow'], note: 'Crystals grow by adding particles to the outside, not by using food. Not alive.' },
  { id: 'robot', name: 'A robot vacuum cleaner', emoji: '🤖', traits: ['move', 'sense', 'nutri'], note: 'It senses walls and “feeds” on electricity, but it doesn’t grow, respire, excrete or reproduce.' },
  { id: 'cloud', name: 'A monsoon cloud', emoji: '☁️', traits: ['move', 'grow'], note: 'Clouds drift and grow, but they are just water droplets. Not alive.' },
  { id: 'you', name: 'You!', emoji: '🧒', traits: ALL, note: 'Every life process is happening in your body right now.' },
]

export const isAlive = (t: Thing) => ALL.every((id) => t.traits.includes(id))
