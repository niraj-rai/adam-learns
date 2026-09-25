export const MAINS_V = 230

export const APPLIANCES = [
  { id: 'led', name: '4 LED bulbs', emoji: '💡', watts: 36 },
  { id: 'fan', name: 'Ceiling fan', emoji: '🌀', watts: 75 },
  { id: 'tv', name: 'Television', emoji: '📺', watts: 100 },
  { id: 'fridge', name: 'Refrigerator', emoji: '🧊', watts: 150 },
  { id: 'laptop', name: 'Laptop charger', emoji: '💻', watts: 65 },
  { id: 'mixie', name: 'Mixer grinder', emoji: '🥤', watts: 750 },
  { id: 'iron', name: 'Electric iron', emoji: '👔', watts: 1000 },
  { id: 'ac', name: 'Air conditioner', emoji: '❄️', watts: 1500 },
  { id: 'geyser', name: 'Geyser (water heater)', emoji: '🚿', watts: 2000 },
  { id: 'induction', name: 'Induction cooktop', emoji: '🍳', watts: 2000 },
]

/** Current drawn (amperes) by appliances running together on 230 V: I = P ÷ V. */
export const currentFor = (watts: number[]) => watts.reduce((s, w) => s + w, 0) / MAINS_V

export const fuseBlows = (current: number, rating: number) => current > rating

/** Heat produced per second in each part of a series circuit is proportional to its resistance (H = I²R). */
export const WIRES = [
  { id: 'copper', name: 'Thick copper wire', r: 0.05 },
  { id: 'nichrome', name: 'Thin nichrome wire', r: 5 },
]
export const heatShare = (rs: number[]) => {
  const total = rs.reduce((s, r) => s + r, 0)
  return rs.map((r) => r / total)
}

/** Electrical energy in kilowatt-hours ("units" on the electricity bill). */
export const units = (watts: number, hours: number) => (watts * hours) / 1000
