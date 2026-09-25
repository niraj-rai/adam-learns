/** Specific heat capacity of water (J per gram per °C) and latent heat of fusion of ice (J per gram). */
export const C_WATER = 4.2
export const L_ICE = 334

/** Final temperature when two amounts of water are mixed (no heat lost to the surroundings). */
export function mixTemperature(m1: number, t1: number, m2: number, t2: number) {
  return (m1 * t1 + m2 * t2) / (m1 + m2)
}

/** Heat energy (J) the water gives out cooling down to 0 °C. */
export const heatAbove0 = (massG: number, tempC: number) => massG * C_WATER * Math.max(0, tempC)

/** Grams of ice at 0 °C that this water could melt while cooling to 0 °C. */
export const iceMelted = (massG: number, tempC: number) => heatAbove0(massG, tempC) / L_ICE
