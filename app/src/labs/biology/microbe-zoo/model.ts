export type Group = 'Bacteria' | 'Fungi' | 'Protozoa' | 'Algae' | 'Virus'
export type Microbe = { id: string; name: string; group: Group; sizeUm: number; emoji: string; sample: string; role: 'useful' | 'harmful' | 'both'; fact: string }

export const MICROBES: Microbe[] = [
  { id: 'lacto', name: 'Lactobacillus', group: 'Bacteria', sizeUm: 3, emoji: '🥛', sample: 'curd', role: 'useful', fact: 'Turns milk into curd by making lactic acid.' },
  { id: 'rhizobium', name: 'Rhizobium', group: 'Bacteria', sizeUm: 2, emoji: '🌱', sample: 'soil', role: 'useful', fact: 'Lives in root nodules of pulses and fixes nitrogen from the air into the soil.' },
  { id: 'cholera', name: 'Vibrio cholerae', group: 'Bacteria', sizeUm: 2, emoji: '💧', sample: 'pond', role: 'harmful', fact: 'Causes cholera; spreads through contaminated water.' },
  { id: 'yeast', name: 'Yeast', group: 'Fungi', sizeUm: 6, emoji: '🍞', sample: 'dough', role: 'useful', fact: 'A single-celled fungus that makes bread rise by releasing carbon dioxide.' },
  { id: 'mould', name: 'Bread mould (Rhizopus)', group: 'Fungi', sizeUm: 10, emoji: '🍄', sample: 'bread', role: 'both', fact: 'Spoils bread, but moulds also decompose waste and give us medicines like penicillin.' },
  { id: 'amoeba', name: 'Amoeba', group: 'Protozoa', sizeUm: 400, emoji: '🫧', sample: 'pond', role: 'both', fact: 'Changes shape as it moves using false feet (pseudopodia). One kind causes amoebic dysentery.' },
  { id: 'paramecium', name: 'Paramecium', group: 'Protozoa', sizeUm: 200, emoji: '🥿', sample: 'pond', role: 'useful', fact: 'Slipper-shaped; swims by beating tiny hairs called cilia.' },
  { id: 'plasmodium', name: 'Plasmodium', group: 'Protozoa', sizeUm: 5, emoji: '🦟', sample: 'blood', role: 'harmful', fact: 'Causes malaria; spread by the bite of female Anopheles mosquitoes.' },
  { id: 'chlamy', name: 'Chlamydomonas', group: 'Algae', sizeUm: 15, emoji: '🟢', sample: 'pond', role: 'useful', fact: 'A single-celled green alga that makes food and oxygen by photosynthesis.' },
  { id: 'spirogyra', name: 'Spirogyra', group: 'Algae', sizeUm: 50, emoji: '🌀', sample: 'pond', role: 'useful', fact: 'Green threads with spiral chloroplasts: the slimy green stuff in ponds.' },
  { id: 'flu', name: 'Influenza virus', group: 'Virus', sizeUm: 0.1, emoji: '🤧', sample: 'air', role: 'harmful', fact: 'Causes flu. Viruses can only reproduce inside living cells.' },
  { id: 'polio', name: 'Poliovirus', group: 'Virus', sizeUm: 0.03, emoji: '💉', sample: 'water', role: 'harmful', fact: 'Causes polio. Thanks to vaccination, India was declared polio-free in 2014.' },
]

/** A light microscope can’t show things smaller than about 0.2 µm. */
export const LIGHT_LIMIT_UM = 0.2
export const visibleWithLight = (m: Microbe) => m.sizeUm >= LIGHT_LIMIT_UM
