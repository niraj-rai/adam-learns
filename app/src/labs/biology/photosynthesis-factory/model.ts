/**
 * Rate of photosynthesis (0–100) from light, carbon dioxide and water (each 0–100),
 * using the idea of a limiting factor: the scarcest ingredient sets the pace. Temperature scales the rate
 * (enzymes work best around 30 °C and stop above about 45 °C).
 */
export function tempFactor(tempC: number) {
  if (tempC >= 45 || tempC <= 0) return 0
  return Math.max(0, 1 - ((tempC - 30) / 20) ** 2)
}

export function rate(light: number, co2: number, water: number, tempC: number) {
  return Math.round(Math.min(light, co2, water) * tempFactor(tempC))
}

export function limitingFactor(light: number, co2: number, water: number, tempC: number): 'light' | 'carbon dioxide' | 'water' | 'temperature' {
  const m = Math.min(light, co2, water)
  if (tempFactor(tempC) < 0.6) return 'temperature'
  return m === light ? 'light' : m === co2 ? 'carbon dioxide' : 'water'
}

/** Oxygen bubbles per minute from a Hydrilla shoot at this rate. */
export const bubbles = (r: number) => Math.round(r / 4)
