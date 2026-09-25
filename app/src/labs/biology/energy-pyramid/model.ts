export const LEVELS = [
  { id: 'producers', name: 'Producers (grass)', emoji: '🌱' },
  { id: 'primary', name: 'Herbivores (grasshoppers)', emoji: '🦗' },
  { id: 'secondary', name: 'Small carnivores (frogs)', emoji: '🐸' },
  { id: 'tertiary', name: 'Larger carnivores (snakes)', emoji: '🐍' },
  { id: 'top', name: 'Top carnivores (eagles)', emoji: '🦅' },
]

/** Energy (kJ) reaching each level: producers capture about 1% of sunlight; each step passes on about `transfer` (10%). */
export function energyAt(level: number, sunlight = 1_000_000, transfer = 0.1) {
  return sunlight * 0.01 * transfer ** level
}
