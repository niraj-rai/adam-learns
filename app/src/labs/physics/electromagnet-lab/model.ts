export const CORES = [
  { id: 'iron', name: 'Iron nail', factor: 1 },
  { id: 'none', name: 'No core (air)', factor: 0.06 },
  { id: 'aluminium', name: 'Aluminium rod', factor: 0.06 },
]

/** Paper clips an electromagnet can hold: grows with turns × current, and much more with an iron core. */
export function clipsHeld(turns: number, cells: number, coreId: string, on = true) {
  if (!on || cells === 0) return 0
  const f = CORES.find((c) => c.id === coreId)!.factor
  return Math.min(30, Math.floor((turns * cells * f) / 10))
}

/** Compass deflection (degrees) under a wire carrying current; reversing the current reverses the deflection. */
export function compassDeflection(cells: number, reversed: boolean) {
  const d = Math.min(75, cells * 25)
  return reversed ? -d : d
}
