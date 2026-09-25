export const SUBSTANCES = [
  { id: 'cells', name: 'Blood cells', filtered: false, reabsorbed: false },
  { id: 'protein', name: 'Proteins', filtered: false, reabsorbed: false },
  { id: 'glucose', name: 'Glucose', filtered: true, reabsorbed: true },
  { id: 'salt', name: 'Salts', filtered: true, reabsorbed: 'partly' as const },
  { id: 'water', name: 'Water', filtered: true, reabsorbed: 'partly' as const },
  { id: 'urea', name: 'Urea (waste)', filtered: true, reabsorbed: false },
]

/** Is the substance normally found in urine? */
export const inUrine = (id: string) => {
  const s = SUBSTANCES.find((x) => x.id === id)!
  return s.filtered && s.reabsorbed !== true
}

/**
 * Daily urine (litres) and how concentrated it is, for water drunk (L) and sweat lost (L).
 * The kidneys keep about 0.5 L as a minimum to flush out urea.
 */
export function urine(drankL: number, sweatL: number) {
  const volume = Math.max(0.5, Math.round((drankL + 0.8 - sweatL - 0.9) * 10) / 10)
  const colour = volume < 0.9 ? 'dark yellow' : volume < 1.8 ? 'pale yellow' : 'very pale'
  return { volume, colour }
}
