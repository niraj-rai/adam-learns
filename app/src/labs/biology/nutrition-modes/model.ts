export type Mode = 'Autotrophic' | 'Parasitic' | 'Insectivorous' | 'Saprotrophic' | 'Symbiotic' | 'Holozoic'

export const MODES: Record<Mode, string> = {
  Autotrophic: 'Makes its own food by photosynthesis',
  Parasitic: 'Takes food from a living host, harming it',
  Insectivorous: 'Makes food but also traps insects for extra nitrogen',
  Saprotrophic: 'Feeds on dead and decaying matter',
  Symbiotic: 'Two organisms live together and both benefit',
  Holozoic: 'Takes in whole food and digests it inside the body (like animals)',
}

export const ORGANISMS: { id: string; name: string; emoji: string; mode: Mode; clue: string }[] = [
  { id: 'mango', name: 'Mango tree', emoji: '🥭', mode: 'Autotrophic', clue: 'Green leaves full of chlorophyll.' },
  { id: 'cuscuta', name: 'Amarbel (Cuscuta)', emoji: '🧶', mode: 'Parasitic', clue: 'Yellow, leafless threads twined around a host plant, sucking its food.' },
  { id: 'pitcher', name: 'Pitcher plant', emoji: '🏺', mode: 'Insectivorous', clue: 'Green leaves shaped into a slippery jug that traps and digests insects. One kind grows in Meghalaya.' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', mode: 'Saprotrophic', clue: 'Grows on rotting wood; no chlorophyll.' },
  { id: 'lichen', name: 'Lichen', emoji: '🪨', mode: 'Symbiotic', clue: 'An alga and a fungus living together on bare rock: the alga makes food, the fungus gives shelter and water.' },
  { id: 'tiger', name: 'Tiger', emoji: '🐅', mode: 'Holozoic', clue: 'Eats other animals and digests them inside its body.' },
  { id: 'tulsi', name: 'Tulsi', emoji: '🌿', mode: 'Autotrophic', clue: 'A green herb.' },
  { id: 'mould', name: 'Bread mould', emoji: '🍞', mode: 'Saprotrophic', clue: 'Grows on stale bread.' },
  { id: 'lice', name: 'Head louse', emoji: '🪳', mode: 'Parasitic', clue: 'Lives on a person’s scalp and feeds on their blood.' },
  { id: 'cow', name: 'Cow', emoji: '🐄', mode: 'Holozoic', clue: 'Eats grass and digests it in its four-chambered stomach.' },
]
