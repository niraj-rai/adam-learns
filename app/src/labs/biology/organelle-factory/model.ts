export type Organelle = { id: string; name: string; clue: string; job: string; factory: string; emoji: string; plantOnly?: boolean }

export const ORGANELLES: Organelle[] = [
  { id: 'nucleus', name: 'Nucleus', clue: 'controls the cell and holds its DNA', emoji: '🧠', job: 'Contains DNA (chromosomes) that controls the cell’s activities and carries instructions for making proteins.', factory: 'The manager’s office, with all the instruction manuals.' },
  { id: 'membrane', name: 'Cell membrane', clue: 'controls what enters and leaves the cell', emoji: '🚪', job: 'A thin, flexible, partially permeable boundary that controls what enters and leaves the cell.', factory: 'The security gate.' },
  { id: 'cytoplasm', name: 'Cytoplasm', clue: 'is the jelly where most reactions happen', emoji: '🫧', job: 'Jelly-like fluid where many chemical reactions happen and the organelles are held.', factory: 'The factory floor.' },
  { id: 'mitochondria', name: 'Mitochondria', clue: 'releases energy by respiration', emoji: '⚡', job: 'Carry out aerobic respiration, releasing energy from glucose as ATP. Called the powerhouse of the cell.', factory: 'The power station.' },
  { id: 'ribosomes', name: 'Ribosomes', clue: 'makes proteins', emoji: '🔧', job: 'Tiny sites where proteins are made, following instructions from the nucleus.', factory: 'The assembly-line workers.' },
  { id: 'er', name: 'Endoplasmic reticulum', clue: 'transports proteins and makes lipids', emoji: '🛤️', job: 'A network of membranes. Rough ER (with ribosomes) makes and transports proteins; smooth ER makes fats (lipids).', factory: 'The conveyor belts and corridors.' },
  { id: 'golgi', name: 'Golgi apparatus', clue: 'packages and sends out proteins', emoji: '📦', job: 'Modifies, packages and sends proteins and other substances to where they are needed, inside or outside the cell.', factory: 'The packing and dispatch department.' },
  { id: 'lysosome', name: 'Lysosomes', clue: 'digests worn-out parts and germs', emoji: '🧹', job: 'Contain digestive enzymes that break down worn-out organelles and germs. Called “suicide bags” because they can digest the cell itself.', factory: 'The recycling and waste-disposal team.' },
  { id: 'wall', name: 'Cell wall', clue: 'supports a plant cell with cellulose', emoji: '🧱', job: 'A rigid layer of cellulose outside the membrane that supports and protects the plant cell.', factory: 'The strong outer factory wall.', plantOnly: true },
  { id: 'chloroplast', name: 'Chloroplasts', clue: 'makes food by photosynthesis', emoji: '🌿', job: 'Contain green chlorophyll and carry out photosynthesis, making glucose from light, carbon dioxide and water.', factory: 'Solar panels that make the raw materials.', plantOnly: true },
  { id: 'vacuole', name: 'Large vacuole', clue: 'stores cell sap and keeps the cell firm', emoji: '💧', job: 'Stores cell sap (water, sugars, salts) and keeps the cell firm (turgid). Animal cells have only small, temporary vacuoles.', factory: 'The storage tank.', plantOnly: true },
]

export const visibleIn = (o: Organelle, type: 'plant' | 'animal') => type === 'plant' || !o.plantOnly
