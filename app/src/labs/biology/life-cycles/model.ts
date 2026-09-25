export const CYCLES = [
  { id: 'frog', name: 'Frog', emoji: '🐸', stages: ['Eggs laid in water', 'Tadpole with gills', 'Tadpole with legs', 'Young frog with a tail', 'Adult frog'], fertilisation: 'external', birth: 'oviparous', metamorphosis: true },
  { id: 'silkworm', name: 'Silk moth', emoji: '🐛', stages: ['Eggs', 'Larva (caterpillar)', 'Pupa inside a silk cocoon', 'Adult moth'], fertilisation: 'internal', birth: 'oviparous', metamorphosis: true },
  { id: 'hen', name: 'Hen', emoji: '🐔', stages: ['Fertilised egg', 'Embryo develops for about 21 days', 'Chick hatches', 'Adult hen'], fertilisation: 'internal', birth: 'oviparous', metamorphosis: false },
  { id: 'cow', name: 'Cow', emoji: '🐄', stages: ['Fertilised egg (zygote)', 'Embryo grows in the uterus', 'Calf is born', 'Adult cow'], fertilisation: 'internal', birth: 'viviparous', metamorphosis: false },
  { id: 'hydra', name: 'Hydra', emoji: '🪸', stages: ['Adult hydra', 'Bud grows on the side', 'Bud develops tentacles', 'Bud detaches as a new hydra'], fertilisation: 'none (asexual budding)', birth: 'budding', metamorphosis: false },
]

export const ANIMALS = [
  { name: 'Hen', oviparous: true },
  { name: 'Cow', oviparous: false },
  { name: 'Frog', oviparous: true },
  { name: 'Human', oviparous: false },
  { name: 'Butterfly', oviparous: true },
  { name: 'Dog', oviparous: false },
  { name: 'Crocodile', oviparous: true },
  { name: 'Elephant', oviparous: false },
]

export const inOrder = (cycleId: string, attempt: string[]) => {
  const c = CYCLES.find((x) => x.id === cycleId)!
  return attempt.length === c.stages.length && attempt.every((s, i) => s === c.stages[i])
}
