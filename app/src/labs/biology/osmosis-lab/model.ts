/** Potato strips in sugar solutions: water moves by osmosis from dilute to concentrated. */
export const ISOTONIC = 0.3 // mol/L sucrose, roughly the concentration inside potato cells

/** Percentage change in mass after 30 minutes (a smooth, textbook-like curve). */
export function massChange(conc: number) {
  const d = ISOTONIC - conc
  return d >= 0 ? 12 * (1 - Math.exp(-d / 0.15)) : -22 * (1 - Math.exp(d / 0.25))
}

export type Tonicity = 'hypotonic' | 'isotonic' | 'hypertonic'
export const tonicity = (conc: number): Tonicity => (Math.abs(conc - ISOTONIC) < 0.02 ? 'isotonic' : conc < ISOTONIC ? 'hypotonic' : 'hypertonic')

export const CELL_RESULT: Record<Tonicity, { plant: string; animal: string }> = {
  hypotonic: { plant: 'Turgid: water enters, the vacuole swells and presses on the cell wall. The wall stops it bursting.', animal: 'Swells and may burst (lyse): there is no cell wall to stop it.' },
  isotonic: { plant: 'No overall change: water moves in and out equally.', animal: 'No overall change: normal shape.' },
  hypertonic: { plant: 'Plasmolysed: water leaves, the cytoplasm shrinks and pulls away from the cell wall.', animal: 'Shrinks and crinkles (crenated) as water leaves.' },
}
