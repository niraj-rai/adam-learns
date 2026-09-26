export type AnimalTissue = { id: string; name: string; type: 'Epithelial' | 'Connective' | 'Muscular' | 'Nervous'; where: string; features: string; job: string }

export const ANIMAL_TISSUES: AnimalTissue[] = [
  { id: 'squamous', name: 'Squamous epithelium', type: 'Epithelial', where: 'Skin surface, lining of the mouth, blood vessels and lung air sacs', features: 'Flat, thin cells fitted together like floor tiles.', job: 'Covers and protects; thin enough for easy diffusion.' },
  { id: 'columnar', name: 'Columnar epithelium', type: 'Epithelial', where: 'Lining of the intestine and windpipe', features: 'Tall, pillar-like cells in a row; some have cilia.', job: 'Absorbs food and secretes mucus; cilia sweep dust out of the airways.' },
  { id: 'blood', name: 'Blood', type: 'Connective', where: 'Heart and blood vessels', features: 'Cells floating in a liquid matrix (plasma): many red cells, a few white cells, platelets.', job: 'Transports oxygen, food, hormones and waste; fights infection.' },
  { id: 'bone', name: 'Bone', type: 'Connective', where: 'The skeleton', features: 'Cells in rings around central canals, in a hard matrix of calcium and phosphorus.', job: 'Supports the body, protects organs and anchors muscles.' },
  { id: 'cartilage', name: 'Cartilage', type: 'Connective', where: 'Ends of bones, nose, ear, rings of the windpipe', features: 'Cells in small spaces, often in pairs, in a firm but flexible matrix.', job: 'Smooths joint surfaces and gives flexible support.' },
  { id: 'skeletal', name: 'Skeletal (striated) muscle', type: 'Muscular', where: 'Muscles attached to bones, e.g. biceps', features: 'Long, cylindrical fibres with light and dark stripes and many nuclei.', job: 'Voluntary movement: you control it.' },
  { id: 'smooth', name: 'Smooth muscle', type: 'Muscular', where: 'Walls of the stomach, intestines, blood vessels, iris', features: 'Spindle-shaped cells with one nucleus and no stripes.', job: 'Involuntary movement, like pushing food along the gut.' },
  { id: 'cardiac', name: 'Cardiac muscle', type: 'Muscular', where: 'Only in the heart', features: 'Branched, striped cells with one nucleus, joined end to end.', job: 'Contracts rhythmically all your life without tiring (involuntary).' },
  { id: 'nerve', name: 'Nervous tissue (neuron)', type: 'Nervous', where: 'Brain, spinal cord and nerves', features: 'A cell body with a nucleus, branching dendrites and one long axon.', job: 'Carries electrical messages very quickly around the body.' },
]
