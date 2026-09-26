import type { Key, Specimen } from './key'

export const PLANT_KEY: Key = {
  start: 'body',
  nodes: {
    body: { q: 'Is the body divided into roots, stem and leaves (or leaf-like parts)?', yes: 'vascular', no: 'thallophyta' },
    vascular: { q: 'Does it have vascular tissue (xylem and phloem) to carry water?', yes: 'seeds', no: 'bryophyta' },
    seeds: { q: 'Does it produce seeds?', yes: 'fruit', no: 'pteridophyta' },
    fruit: { q: 'Are the seeds enclosed inside a fruit?', yes: 'angiosperm', no: 'gymnosperm' },
  },
  groups: {
    thallophyta: { name: 'Thallophyta (algae)', emoji: '🟢', about: 'No roots, stems or leaves; mostly live in water. e.g. Spirogyra, Ulva, Chara.' },
    bryophyta: { name: 'Bryophyta', emoji: '🌿', about: 'Simple plant body with leaf-like and stem-like parts but no vascular tissue: the “amphibians of the plant kingdom”. e.g. mosses, Marchantia, Riccia.' },
    pteridophyta: { name: 'Pteridophyta', emoji: '🌿', about: 'Roots, stems and leaves with vascular tissue, but no seeds: they spread by spores. e.g. ferns, Marsilea, horsetails.' },
    gymnosperm: { name: 'Gymnosperms', emoji: '🌲', about: '“Naked seeds” in cones, not inside fruits. Often evergreen. e.g. pine, deodar, Cycas.' },
    angiosperm: { name: 'Angiosperms', emoji: '🌸', about: 'Flowering plants with seeds inside fruits. Monocots (one seed leaf, e.g. wheat, maize) and dicots (two, e.g. mango, pea).' },
  },
}

export const PLANT_SPECIMENS: Specimen[] = [
  { name: 'Spirogyra', emoji: '🟢', description: 'Green, slimy threads floating in a pond. No roots, stem or leaves.', group: 'thallophyta', answers: { body: false } },
  { name: 'Moss', emoji: '🌱', description: 'A soft green carpet on a damp wall. Tiny leaf-like parts, but no proper roots or water-carrying tubes.', group: 'bryophyta', answers: { body: true, vascular: false } },
  { name: 'Fern', emoji: '🌿', description: 'Feathery fronds with brown dots (spore cases) underneath. Has roots and vascular tissue, but never makes seeds.', group: 'pteridophyta', answers: { body: true, vascular: true, seeds: false } },
  { name: 'Deodar (Himalayan cedar)', emoji: '🌲', description: 'A tall evergreen tree with needle-like leaves. Its seeds sit on the scales of woody cones.', group: 'gymnosperm', answers: { body: true, vascular: true, seeds: true, fruit: false } },
  { name: 'Mango tree', emoji: '🥭', description: 'Flowers in spring, then juicy fruits each with a large seed inside.', group: 'angiosperm', answers: { body: true, vascular: true, seeds: true, fruit: true } },
  { name: 'Wheat', emoji: '🌾', description: 'A grass with long narrow leaves; its grains are fruits containing a seed.', group: 'angiosperm', answers: { body: true, vascular: true, seeds: true, fruit: true } },
]

export const ANIMAL_KEY: Key = {
  start: 'backbone',
  nodes: {
    backbone: { q: 'Does it have a backbone (a notochord or vertebral column)?', yes: 'fish', no: 'pores' },
    pores: { q: 'Is its body full of pores, with no real tissues or organs?', yes: 'porifera', no: 'tentacles' },
    tentacles: { q: 'Is it a soft, hollow body with a single opening surrounded by stinging tentacles?', yes: 'cnidaria', no: 'jointed' },
    jointed: { q: 'Does it have jointed legs and a hard outer skeleton (exoskeleton)?', yes: 'arthropoda', no: 'spiny' },
    spiny: { q: 'Does it have spiny skin and a star-shaped (five-part) body?', yes: 'echinodermata', no: 'shell' },
    shell: { q: 'Does it have a soft body, a muscular foot, and usually a shell?', yes: 'mollusca', no: 'segments' },
    segments: { q: 'Is its body divided into many ring-like segments?', yes: 'annelida', no: 'flat' },
    flat: { q: 'Is its body flat like a ribbon or leaf?', yes: 'platyhelminthes', no: 'nematoda' },
    fish: { q: 'Does it breathe with gills all its life and have fins?', yes: 'pisces', no: 'feathers' },
    feathers: { q: 'Does it have feathers?', yes: 'aves', no: 'hair' },
    hair: { q: 'Does it have hair or fur and feed its young on milk?', yes: 'mammalia', no: 'scales' },
    scales: { q: 'Does it have dry, scaly skin and lay eggs with shells on land?', yes: 'reptilia', no: 'amphibia' },
  },
  groups: {
    porifera: { name: 'Porifera (sponges)', emoji: '🧽', about: 'Simple animals full of pores, fixed to rocks under water.' },
    cnidaria: { name: 'Cnidaria (Coelenterata)', emoji: '🪼', about: 'Hollow body, one opening, stinging tentacles. e.g. Hydra, jellyfish, corals.' },
    platyhelminthes: { name: 'Platyhelminthes (flatworms)', emoji: '🪱', about: 'Flat bodies; many are parasites. e.g. tapeworm, liver fluke, Planaria.' },
    nematoda: { name: 'Nematoda (roundworms)', emoji: '🪱', about: 'Round, unsegmented worms; many are parasites. e.g. Ascaris, filarial worm.' },
    annelida: { name: 'Annelida', emoji: '🪱', about: 'Segmented worms. e.g. earthworm, leech.' },
    arthropoda: { name: 'Arthropoda', emoji: '🦀', about: 'Jointed legs and an exoskeleton: the largest group of animals. e.g. insects, spiders, crabs, centipedes.' },
    mollusca: { name: 'Mollusca', emoji: '🐌', about: 'Soft body, muscular foot, usually a shell. e.g. snail, mussel, octopus.' },
    echinodermata: { name: 'Echinodermata', emoji: '⭐', about: 'Spiny skin, five-part symmetry, tube feet; all live in the sea. e.g. starfish, sea urchin.' },
    pisces: { name: 'Vertebrates: Fish (Pisces)', emoji: '🐟', about: 'Gills, fins and scales; cold-blooded. e.g. rohu, shark.' },
    amphibia: { name: 'Vertebrates: Amphibians', emoji: '🐸', about: 'Moist skin; live on land and in water; lay eggs in water. e.g. frog, toad.' },
    reptilia: { name: 'Vertebrates: Reptiles', emoji: '🐢', about: 'Dry scaly skin, eggs with leathery shells; cold-blooded. e.g. lizard, snake, turtle.' },
    aves: { name: 'Vertebrates: Birds (Aves)', emoji: '🦚', about: 'Feathers, beaks, warm-blooded, lay hard-shelled eggs. e.g. peacock, crow.' },
    mammalia: { name: 'Vertebrates: Mammals', emoji: '🐅', about: 'Hair or fur, feed young on milk, warm-blooded. e.g. tiger, human, bat, whale.' },
  },
}

export const ANIMAL_SPECIMENS: Specimen[] = [
  { name: 'Sponge', emoji: '🧽', description: 'Attached to a rock underwater; its body is full of tiny holes.', group: 'porifera', answers: { backbone: false, pores: true } },
  { name: 'Hydra', emoji: '🪼', description: 'A tiny tube-shaped pond animal with one mouth ringed by stinging tentacles.', group: 'cnidaria', answers: { backbone: false, pores: false, tentacles: true } },
  { name: 'Earthworm', emoji: '🪱', description: 'A long soft body made of many rings; lives in soil.', group: 'annelida', answers: { backbone: false, pores: false, tentacles: false, jointed: false, spiny: false, shell: false, segments: true } },
  { name: 'Tapeworm', emoji: '🪱', description: 'A long, flat, ribbon-like parasite living in the intestine.', group: 'platyhelminthes', answers: { backbone: false, pores: false, tentacles: false, jointed: false, spiny: false, shell: false, segments: false, flat: true } },
  { name: 'Butterfly', emoji: '🦋', description: 'Six jointed legs, antennae and a hard outer covering.', group: 'arthropoda', answers: { backbone: false, pores: false, tentacles: false, jointed: true } },
  { name: 'Snail', emoji: '🐌', description: 'A soft body that glides on a muscular foot, with a coiled shell.', group: 'mollusca', answers: { backbone: false, pores: false, tentacles: false, jointed: false, spiny: false, shell: true } },
  { name: 'Starfish', emoji: '⭐', description: 'Five arms, rough spiny skin, lives on the sea floor.', group: 'echinodermata', answers: { backbone: false, pores: false, tentacles: false, jointed: false, spiny: true } },
  { name: 'Frog', emoji: '🐸', description: 'Backbone; smooth moist skin; tadpoles breathe with gills, adults with lungs.', group: 'amphibia', answers: { backbone: true, fish: false, feathers: false, hair: false, scales: false } },
  { name: 'Peacock', emoji: '🦚', description: 'Backbone, beak and a spectacular tail of feathers.', group: 'aves', answers: { backbone: true, fish: false, feathers: true } },
  { name: 'Bat', emoji: '🦇', description: 'Backbone, furry body, flies at night, feeds its babies on milk.', group: 'mammalia', answers: { backbone: true, fish: false, feathers: false, hair: true } },
  { name: 'Cobra', emoji: '🐍', description: 'Backbone, dry scaly skin, lays leathery eggs on land.', group: 'reptilia', answers: { backbone: true, fish: false, feathers: false, hair: false, scales: true } },
  { name: 'Rohu', emoji: '🐟', description: 'Backbone, fins and gills; lives in rivers all its life.', group: 'pisces', answers: { backbone: true, fish: true } },
]
