export type Role = 'abiotic' | 'producer' | 'consumer' | 'decomposer'
export const ROLES: Record<Role, { name: string; emoji: string; job: string }> = {
  abiotic: { name: 'Non-living (abiotic)', emoji: '☀️', job: 'Sunlight, water, air, soil and temperature: the physical conditions life depends on' },
  producer: { name: 'Producer', emoji: '🌿', job: 'Makes its own food by photosynthesis, capturing the Sun’s energy for the whole ecosystem' },
  consumer: { name: 'Consumer', emoji: '🦌', job: 'Eats other organisms: herbivores eat plants, carnivores eat animals, omnivores eat both' },
  decomposer: { name: 'Decomposer', emoji: '🍄', job: 'Breaks down dead matter, recycling nutrients back into the soil' },
}

export const ITEMS: { id: string; name: string; emoji: string; role: Role }[] = [
  { id: 'sun', name: 'Sunlight', emoji: '☀️', role: 'abiotic' },
  { id: 'water', name: 'Pond water', emoji: '💧', role: 'abiotic' },
  { id: 'soil', name: 'Soil', emoji: '🟫', role: 'abiotic' },
  { id: 'grass', name: 'Grass', emoji: '🌱', role: 'producer' },
  { id: 'algae', name: 'Algae', emoji: '🟢', role: 'producer' },
  { id: 'lotus', name: 'Lotus', emoji: '🪷', role: 'producer' },
  { id: 'fish', name: 'Rohu fish', emoji: '🐟', role: 'consumer' },
  { id: 'frog', name: 'Frog', emoji: '🐸', role: 'consumer' },
  { id: 'heron', name: 'Heron', emoji: '🪶', role: 'consumer' },
  { id: 'snail', name: 'Snail', emoji: '🐌', role: 'consumer' },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', role: 'decomposer' },
  { id: 'bacteria', name: 'Soil bacteria', emoji: '🦠', role: 'decomposer' },
]
