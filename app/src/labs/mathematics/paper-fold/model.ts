/** A sheet of paper about 0.1 mm thick doubles in thickness with every fold. */
export const SHEET = 0.0001
export const thickness = (folds: number, t0 = SHEET) => t0 * 2 ** folds

export const LANDMARKS = [
  { name: 'A thick book', emoji: '📕', m: 0.05 },
  { name: 'Adam', emoji: '🧒', m: 1.6 },
  { name: 'Qutub Minar', emoji: '🗼', m: 73 },
  { name: 'Mount Everest', emoji: '🏔️', m: 8849 },
  { name: 'International Space Station', emoji: '🛰️', m: 400_000 },
  { name: 'The Moon', emoji: '🌕', m: 384_400_000 },
  { name: 'The Sun', emoji: '☀️', m: 149_600_000_000 },
]

/** Fewest folds for the stack to reach a height. */
export const foldsToReach = (m: number, t0 = SHEET) => Math.ceil(Math.log2(m / t0) - 1e-9)

export function formatLength(m: number) {
  if (m < 0.01) return `${(m * 1000).toPrecision(3)} mm`
  if (m < 1) return `${(m * 100).toPrecision(3)} cm`
  if (m < 1000) return `${m.toPrecision(3)} m`
  return `${Math.round(m / 1000).toLocaleString('en-IN')} km`
}
