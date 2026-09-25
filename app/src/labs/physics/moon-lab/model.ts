export const SYNODIC = 29.53

/** Fraction of the Moon's face that is lit, as seen from Earth, `day` days after new moon. */
export const illuminated = (day: number) => (1 - Math.cos((2 * Math.PI * day) / SYNODIC)) / 2

export function phaseName(day: number) {
  const d = ((day % SYNODIC) + SYNODIC) % SYNODIC
  const p = d / SYNODIC
  if (p < 0.034 || p > 0.966) return 'New moon'
  if (p < 0.216) return 'Waxing crescent'
  if (p < 0.284) return 'First quarter'
  if (p < 0.466) return 'Waxing gibbous'
  if (p < 0.534) return 'Full moon'
  if (p < 0.716) return 'Waning gibbous'
  if (p < 0.784) return 'Last quarter'
  return 'Waning crescent'
}

/** Hindu lunar calendar names for the two halves of the month. */
export const paksha = (day: number) => ((day % SYNODIC) / SYNODIC < 0.5 ? 'Shukla paksha (waxing): towards Purnima' : 'Krishna paksha (waning): towards Amavasya')

/**
 * Eclipses need the Sun, Earth and Moon in a straight line. The Moon's orbit is tilted about 5°,
 * so this only happens when a new or full moon falls near a “node” (where the orbit crosses the ecliptic).
 */
export function eclipse(day: number, nodeOffsetDeg: number) {
  const name = phaseName(day)
  const near = Math.abs(nodeOffsetDeg) <= 10
  if (name === 'New moon' && near) return 'solar'
  if (name === 'Full moon' && near) return 'lunar'
  return null
}
