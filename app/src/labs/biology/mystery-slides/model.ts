import type { SpecimenId } from '../virtual-microscope/model'

export type Slide = { specimen: SpecimenId; answer: string; options: string[]; why: string }

export const SLIDES: Slide[] = [
  { specimen: 'onion', answer: 'Plant cells (no chloroplasts)', options: ['Plant cells (no chloroplasts)', 'Animal cells', 'Bacteria', 'Red blood cells'], why: 'Regular brick shapes with thick cell walls: plant cells. No chloroplasts, like an onion bulb grown underground.' },
  { specimen: 'cheek', answer: 'Animal cells', options: ['Plant cells with chloroplasts', 'Animal cells', 'Nerve cells', 'Bacteria'], why: 'Irregular shapes, no cell wall, one nucleus each: animal cells (cheek lining).' },
  { specimen: 'hydrilla', answer: 'Plant cells with chloroplasts', options: ['Animal cells', 'Plant cells with chloroplasts', 'Red blood cells', 'Plant cells (no chloroplasts)'], why: 'Green chloroplasts inside walled cells: a leaf that can photosynthesise.' },
  { specimen: 'bacteria', answer: 'Bacteria', options: ['Bacteria', 'Animal cells', 'Red blood cells', 'Nerve cells'], why: 'Tiny rods (about 3 µm) with no nucleus, visible only at the highest power: bacteria.' },
  { specimen: 'blood', answer: 'Red blood cells', options: ['Plant cells with chloroplasts', 'Bacteria', 'Red blood cells', 'Animal cells'], why: 'Small round discs with pale centres and no nucleus: red blood cells.' },
  { specimen: 'neuron', answer: 'Nerve cells', options: ['Nerve cells', 'Plant cells (no chloroplasts)', 'Animal cells', 'Bacteria'], why: 'A cell body with a nucleus and long, branching extensions: nerve cells.' },
]
