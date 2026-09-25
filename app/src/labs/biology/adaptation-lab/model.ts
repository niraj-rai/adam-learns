export const HABITATS = [
  { id: 'desert', name: 'Thar Desert', emoji: '🏜️', challenge: 'Very hot days, cold nights, little water, blowing sand' },
  { id: 'snow', name: 'High Himalaya', emoji: '🏔️', challenge: 'Freezing cold, snow, steep rocky slopes, thin air' },
  { id: 'ocean', name: 'Arabian Sea', emoji: '🌊', challenge: 'Living underwater, needing to swim fast' },
  { id: 'forest', name: 'Western Ghats rainforest', emoji: '🌳', challenge: 'Tall trees, heavy rain, food high in the canopy' },
]

export const FEATURES = [
  { id: 'hump', name: 'Hump storing fat', emoji: '🐫', helps: ['desert'] },
  { id: 'padfeet', name: 'Wide padded feet', emoji: '🦶', helps: ['desert', 'snow'] },
  { id: 'lashes', name: 'Long eyelashes and closable nostrils', emoji: '👁️', helps: ['desert'] },
  { id: 'fur', name: 'Thick fur coat', emoji: '🧥', helps: ['snow'] },
  { id: 'tail', name: 'Long thick tail to wrap around for warmth and balance', emoji: '🐆', helps: ['snow', 'forest'] },
  { id: 'white', name: 'Pale camouflage', emoji: '🤍', helps: ['snow', 'desert'] },
  { id: 'gills', name: 'Gills to breathe oxygen from water', emoji: '🐟', helps: ['ocean'] },
  { id: 'streamlined', name: 'Streamlined body and fins', emoji: '🐬', helps: ['ocean'] },
  { id: 'blubber', name: 'Thick layer of fat (blubber) under the skin', emoji: '🐋', helps: ['ocean', 'snow'] },
  { id: 'grip', name: 'Gripping hands and feet for climbing', emoji: '🐒', helps: ['forest'] },
  { id: 'glide', name: 'Skin flaps for gliding between trees', emoji: '🦇', helps: ['forest'] },
  { id: 'greenskin', name: 'Green or patterned camouflage', emoji: '🦎', helps: ['forest'] },
]

export const helpful = (featureId: string, habitatId: string) => FEATURES.find((f) => f.id === featureId)!.helps.includes(habitatId)

/** A design survives if all its chosen features suit the habitat. */
export const survives = (features: string[], habitat: string) => features.length === 3 && features.every((f) => helpful(f, habitat))
