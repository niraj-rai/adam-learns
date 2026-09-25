export const ACTIVITIES = [
  { id: 'sleep', name: 'Sleeping', emoji: '😴', breaths: 12, heart: 60 },
  { id: 'rest', name: 'Sitting quietly', emoji: '🧘', breaths: 15, heart: 72 },
  { id: 'walk', name: 'Brisk walking', emoji: '🚶', breaths: 22, heart: 100 },
  { id: 'run', name: 'Running', emoji: '🏃', breaths: 40, heart: 160 },
]

/**
 * Bell-jar lung model: pulling the rubber sheet (diaphragm) down increases the space in the jar, lowers the pressure
 * inside, and air rushes into the balloons (lungs). `pull` is 0 (pushed up) to 1 (pulled right down). Returns balloon size 0–1.
 */
export const lungFill = (pull: number) => Math.max(0, Math.min(1, pull))
export const airFlow = (prevPull: number, pull: number) => (pull > prevPull ? 'in' : pull < prevPull ? 'out' : 'none')

/** Seconds for limewater to turn milky when air is bubbled through it. Exhaled air has about 100× more CO₂. */
export const limewaterSeconds = (air: 'inhaled' | 'exhaled') => (air === 'exhaled' ? 20 : 2000)

/** Litres of air breathed per minute: breaths × about 0.5 L per breath (more per breath when exercising). */
export const litresPerMinute = (breaths: number) => Math.round(breaths * (breaths > 20 ? 1.5 : 0.5) * 10) / 10
