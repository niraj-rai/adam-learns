/** Planet data: mean distance from the Sun (AU), diameter (km), orbital period (Earth years). */
export const PLANETS = [
  { id: 'mercury', name: 'Mercury', emoji: '☿️', au: 0.39, km: 4879, years: 0.24, colour: '#a8a29e', fact: 'Smallest planet; no moons; a year lasts just 88 days.' },
  { id: 'venus', name: 'Venus', emoji: '🟡', au: 0.72, km: 12104, years: 0.62, colour: '#fbbf24', fact: 'Hottest planet (about 465 °C) because its thick CO₂ atmosphere traps heat. Visible as the “morning/evening star”.' },
  { id: 'earth', name: 'Earth', emoji: '🌍', au: 1, km: 12742, years: 1, colour: '#3b82f6', fact: 'The only known planet with liquid water on its surface, and life.' },
  { id: 'mars', name: 'Mars', emoji: '🔴', au: 1.52, km: 6779, years: 1.88, colour: '#ef4444', fact: 'The red planet (rusty iron oxide dust). India’s Mangalyaan reached it in 2014 on its first attempt.' },
  { id: 'jupiter', name: 'Jupiter', emoji: '🟠', au: 5.2, km: 139820, years: 11.86, colour: '#f97316', fact: 'Largest planet: over 1,300 Earths would fit inside. Its Great Red Spot is a giant storm.' },
  { id: 'saturn', name: 'Saturn', emoji: '🪐', au: 9.58, km: 116460, years: 29.46, colour: '#eab308', fact: 'Famous for its rings of ice and rock. It is so light for its size that it would float in a giant bathtub!' },
  { id: 'uranus', name: 'Uranus', emoji: '🔵', au: 19.2, km: 50724, years: 84.0, colour: '#22d3ee', fact: 'Rolls around the Sun on its side, tilted about 98°.' },
  { id: 'neptune', name: 'Neptune', emoji: '🔷', au: 30.05, km: 49244, years: 164.8, colour: '#6366f1', fact: 'Windiest planet: winds of over 2000 km/h.' },
]

export const SUN_KM = 1_392_700
export const AU_KM = 149_600_000

/** Scale model: if the Sun were `sunCm` wide, how far away (metres) and how big (mm) would a planet be? */
export function scaleModel(sunCm: number) {
  const f = sunCm / 100 / (SUN_KM * 1000) // metres per metre
  return PLANETS.map((p) => ({ ...p, distanceM: p.au * AU_KM * 1000 * f, sizeMm: p.km * 1000 * f * 1000 }))
}

/** Light-travel time from the Sun in minutes. */
export const lightMinutes = (au: number) => (au * AU_KM) / 299_792 / 60
