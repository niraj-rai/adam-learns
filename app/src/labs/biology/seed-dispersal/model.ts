export type Feature = 'wings' | 'hairs' | 'hooks' | 'fleshy' | 'husk' | 'pod' | 'plain'
export const FEATURES: Record<Feature, { name: string; emoji: string; example: string }> = {
  wings: { name: 'Winged seed', emoji: '🪽', example: 'Drumstick (moringa), maple' },
  hairs: { name: 'Fluffy hairs', emoji: '☁️', example: 'Madar (Calotropis), cotton, dandelion' },
  hooks: { name: 'Hooks and spines', emoji: '🪝', example: 'Xanthium, “chor kanta” burrs' },
  fleshy: { name: 'Tasty fleshy fruit', emoji: '🍒', example: 'Guava, jamun, banyan figs' },
  husk: { name: 'Light, air-filled husk', emoji: '🥥', example: 'Coconut, lotus' },
  pod: { name: 'Exploding pod', emoji: '💥', example: 'Balsam, castor, peas' },
  plain: { name: 'Plain heavy seed', emoji: '🌰', example: 'Falls near the parent' },
}

export const PLACES = [
  { id: 'hill', name: 'Windy hillside', emoji: '🌬️', best: ['wings', 'hairs'] as Feature[] },
  { id: 'river', name: 'Riverbank or seashore', emoji: '🌊', best: ['husk'] as Feature[] },
  { id: 'forest', name: 'Forest full of birds and monkeys', emoji: '🐒', best: ['fleshy', 'hooks'] as Feature[] },
  { id: 'meadow', name: 'Crowded meadow', emoji: '🌼', best: ['pod', 'hairs', 'hooks'] as Feature[] },
]

/** Typical dispersal distance (metres) for a feature in a place. */
export function distance(f: Feature, placeId: string) {
  const base: Record<Feature, number> = { wings: 60, hairs: 200, hooks: 150, fleshy: 400, husk: 1000, pod: 5, plain: 1 }
  const p = PLACES.find((x) => x.id === placeId)!
  const d = base[f]
  return p.best.includes(f) ? d : Math.max(1, Math.round(d * 0.05))
}
