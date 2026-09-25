export const PARTS = [
  { id: 'sepal', name: 'Sepal', whorl: 'outer', job: 'Green leaf-like parts that protect the flower bud.' },
  { id: 'petal', name: 'Petal', whorl: 'outer', job: 'Colourful parts that attract insects and birds.' },
  { id: 'anther', name: 'Anther', whorl: 'male (stamen)', job: 'Makes pollen grains, which contain the male cells.' },
  { id: 'filament', name: 'Filament', whorl: 'male (stamen)', job: 'The stalk that holds up the anther.' },
  { id: 'stigma', name: 'Stigma', whorl: 'female (pistil)', job: 'Sticky top that catches pollen.' },
  { id: 'style', name: 'Style', whorl: 'female (pistil)', job: 'The tube leading from the stigma down to the ovary.' },
  { id: 'ovary', name: 'Ovary', whorl: 'female (pistil)', job: 'Contains ovules (with egg cells). After fertilisation it becomes the fruit.' },
  { id: 'ovule', name: 'Ovule', whorl: 'female (pistil)', job: 'Contains an egg cell. After fertilisation it becomes a seed.' },
] as const

export type PollinatorVisit = { from: 'A' | 'B'; to: 'A' | 'B' }
/** Self-pollination: pollen lands on a stigma of the same plant. Cross-pollination: from another plant of the same kind. */
export const pollinationType = (v: PollinatorVisit) => (v.from === v.to ? 'self' : 'cross')

export const AGENTS = [
  { id: 'insect', name: 'Insects', example: 'Bees on mustard and sunflower', clue: 'Bright petals, scent and nectar' },
  { id: 'wind', name: 'Wind', example: 'Maize, wheat and grasses', clue: 'Small dull flowers, lots of light pollen, feathery stigmas' },
  { id: 'bird', name: 'Birds', example: 'Sunbirds on hibiscus and coral trees', clue: 'Red or orange tube-shaped flowers with nectar' },
  { id: 'water', name: 'Water', example: 'Some water plants like Vallisneria', clue: 'Pollen floats on water' },
]
