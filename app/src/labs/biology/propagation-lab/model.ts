export type Method = 'stem' | 'leaf' | 'root' | 'tuber' | 'bulb' | 'rhizome'
export const METHOD_NAME: Record<Method, string> = { stem: 'Stem cutting', leaf: 'Leaf', root: 'Root', tuber: 'Tuber ("eye")', bulb: 'Bulb', rhizome: 'Rhizome (underground stem)' }

export const PLANTS: { id: string; name: string; emoji: string; works: Method[]; note: string }[] = [
  { id: 'potato', name: 'Potato', emoji: '🥔', works: ['tuber'], note: 'Each “eye” on a potato tuber is a bud that can grow into a new plant.' },
  { id: 'rose', name: 'Rose', emoji: '🌹', works: ['stem'], note: 'A stem cutting with nodes planted in moist soil grows roots.' },
  { id: 'bryophyllum', name: 'Bryophyllum (patharchatta)', emoji: '🍃', works: ['leaf'], note: 'Tiny buds along the leaf edges grow into new plants.' },
  { id: 'ginger', name: 'Ginger', emoji: '🫚', works: ['rhizome'], note: 'Ginger is an underground stem with buds.' },
  { id: 'sweetpotato', name: 'Sweet potato', emoji: '🍠', works: ['root'], note: 'Its swollen root can sprout new shoots.' },
  { id: 'onion', name: 'Onion', emoji: '🧅', works: ['bulb'], note: 'A bulb is a short stem with fleshy leaves; it sprouts new shoots.' },
  { id: 'sugarcane', name: 'Sugarcane', emoji: '🎋', works: ['stem'], note: 'Farmers plant pieces of stem with nodes.' },
  { id: 'money', name: 'Money plant', emoji: '🪴', works: ['stem'], note: 'A stem piece in water quickly grows roots.' },
]

export const works = (plantId: string, m: Method) => PLANTS.find((p) => p.id === plantId)!.works.includes(m)

export const OTHER_ASEXUAL = [
  { id: 'fission', name: 'Binary fission', example: 'Amoeba, bacteria', how: 'The cell splits into two.' },
  { id: 'budding', name: 'Budding', example: 'Yeast, Hydra', how: 'A small bud grows out of the parent and breaks off.' },
  { id: 'fragmentation', name: 'Fragmentation', example: 'Spirogyra', how: 'The organism breaks into pieces that each grow.' },
  { id: 'spores', name: 'Spore formation', example: 'Bread mould, ferns, mosses', how: 'Tiny spores are released and grow when conditions are right.' },
]
