/** A dichotomous key to eight organisms of the Western Ghats. Each question node has a yes branch and a no branch. */
export type KeyNode = { q: string; trait: string; yes: KeyNode | string; no: KeyNode | string }

export const KEY: KeyNode = {
  q: 'Is it green, and does it make its own food from sunlight?', trait: 'plant',
  yes: 'neelakurinji',
  no: {
    q: 'Does it have a backbone?', trait: 'backbone',
    yes: {
      q: 'Does it have feathers?', trait: 'feathers',
      yes: 'hornbill',
      no: {
        q: 'Does it have fur or hair?', trait: 'fur',
        yes: { q: 'Does it have a long bushy tail and live in tree tops, eating fruit and nuts?', trait: 'bushy', yes: 'squirrel', no: 'macaque' },
        no: { q: 'Does it have dry, scaly skin?', trait: 'scales', yes: 'cobra', no: 'frog' },
      },
    },
    no: { q: 'Does it have six legs and wings?', trait: 'insect', yes: 'birdwing', no: 'fungus' },
  },
}

export type Specimen = { id: string; name: string; emoji: string; clue: string; traits: Record<string, boolean>; fact: string }

export const SPECIMENS: Specimen[] = [
  { id: 'hornbill', name: 'Great hornbill', emoji: '🦜', clue: 'A huge black-and-yellow bird with a giant casque on its beak, flapping noisily over the forest.', traits: { plant: false, backbone: true, feathers: true }, fact: 'The state bird of Kerala. Hornbills spread seeds of forest trees.' },
  { id: 'squirrel', name: 'Malabar giant squirrel', emoji: '🐿️', clue: 'A furry, maroon-and-cream animal as long as your arm, leaping between tree tops with a long bushy tail.', traits: { plant: false, backbone: true, feathers: false, fur: true, bushy: true }, fact: 'It rarely comes down to the ground.' },
  { id: 'macaque', name: 'Lion-tailed macaque', emoji: '🐒', clue: 'A furry black monkey with a silver mane around its face and a thin tail with a tuft at the end.', traits: { plant: false, backbone: true, feathers: false, fur: true, bushy: false }, fact: 'Endangered: found only in the Western Ghats.' },
  { id: 'cobra', name: 'King cobra', emoji: '🐍', clue: 'A very long, legless animal with dry scaly skin; it raises its hood when disturbed.', traits: { plant: false, backbone: true, feathers: false, fur: false, scales: true }, fact: 'The world’s longest venomous snake; it even builds a nest for its eggs.' },
  { id: 'frog', name: 'Purple frog', emoji: '🐸', clue: 'A plump, moist-skinned, purple animal with a pointed snout, found underground near streams after the monsoon.', traits: { plant: false, backbone: true, feathers: false, fur: false, scales: false }, fact: 'It lives underground and surfaces for only a few weeks a year to breed.' },
  { id: 'birdwing', name: 'Southern birdwing', emoji: '🦋', clue: 'A huge black-and-yellow flying creature with six legs, feeding on flowers.', traits: { plant: false, backbone: false, insect: true }, fact: 'India’s largest butterfly, with a wingspan of up to about 19 cm.' },
  { id: 'fungus', name: 'Bracket fungus', emoji: '🍄', clue: 'A hard, shelf-like brown growth on a rotting log. It has no legs, no leaves and isn’t green.', traits: { plant: false, backbone: false, insect: false }, fact: 'Fungi are decomposers: they recycle nutrients from dead wood.' },
  { id: 'neelakurinji', name: 'Neelakurinji', emoji: '💐', clue: 'A green shrub covering whole hillsides in blue flowers.', traits: { plant: true }, fact: 'It flowers only once every 12 years, turning the Nilgiri (“blue mountain”) slopes blue.' },
]

/** Follow the key using a specimen's true traits. */
export function identify(traits: Record<string, boolean>, node: KeyNode | string = KEY): string {
  if (typeof node === 'string') return node
  return identify(traits, traits[node.trait] ? node.yes : node.no)
}
