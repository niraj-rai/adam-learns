/** Illustrative zone-of-inhibition diameters (mm) around paper discs on a plate of bacteria. */
export const DISCS = [
  { id: 'water', name: 'Plain water (control)', emoji: '💧', zone: 0, resistantZone: 0 },
  { id: 'soap', name: 'Soap solution', emoji: '🧼', zone: 6, resistantZone: 6 },
  { id: 'sanitiser', name: 'Hand sanitiser (alcohol)', emoji: '🧴', zone: 10, resistantZone: 10 },
  { id: 'antibiotic', name: 'Antibiotic', emoji: '💊', zone: 24, resistantZone: 0 },
]

/** Illustrative bacterial colonies grown from a fingertip pressed onto agar. */
export const HANDS = [
  { id: 'unwashed', name: 'Unwashed hands after playing', colonies: 150 },
  { id: 'rinse', name: 'Quick rinse with water', colonies: 90 },
  { id: 'soap', name: 'Soap and water for 20 seconds', colonies: 12 },
  { id: 'sanitiser', name: 'Alcohol hand sanitiser', colonies: 8 },
]

export const zoneFor = (discId: string, resistant: boolean) => {
  const d = DISCS.find((x) => x.id === discId)!
  return resistant ? d.resistantZone : d.zone
}
