export type Moisture = 'dry' | 'damp' | 'soggy'

/**
 * Days for a kitchen-waste compost bin to be ready. Decomposers need a mix of “greens” (wet kitchen waste, rich in
 * nitrogen) and “browns” (dry leaves, paper), dampness like a wrung-out sponge, and air (turning).
 */
export function compostDays(greensPct: number, moisture: Moisture, turned: boolean) {
  const mix = 1 - Math.abs(greensPct - 40) / 60 // best around 40% greens
  const water = moisture === 'damp' ? 1 : moisture === 'dry' ? 0.3 : 0.45
  const air = turned ? 1 : 0.55
  const speed = Math.max(0.05, mix * water * air)
  return Math.round(45 / speed)
}

/** A soggy, unturned bin runs short of oxygen and smells bad (anaerobic decomposition). */
export const smelly = (moisture: Moisture, turned: boolean) => moisture === 'soggy' && !turned

export const ITEMS = [
  { id: 'peel', name: 'Vegetable peels', emoji: '🥕', decomposes: true },
  { id: 'leaves', name: 'Dry leaves', emoji: '🍂', decomposes: true },
  { id: 'paper', name: 'Newspaper', emoji: '📰', decomposes: true },
  { id: 'tea', name: 'Used tea leaves', emoji: '🍵', decomposes: true },
  { id: 'eggshell', name: 'Eggshells', emoji: '🥚', decomposes: true },
  { id: 'plastic', name: 'Plastic bag', emoji: '🛍️', decomposes: false },
  { id: 'glass', name: 'Glass bottle', emoji: '🍾', decomposes: false },
  { id: 'foil', name: 'Aluminium foil', emoji: '🥫', decomposes: false },
]
