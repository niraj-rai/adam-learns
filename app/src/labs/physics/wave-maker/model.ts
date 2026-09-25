/** Approximate hearing ranges in hertz. */
export const HEARING = [
  { id: 'elephant', name: 'Elephant', emoji: '🐘', min: 16, max: 12000 },
  { id: 'human', name: 'Human', emoji: '🧒', min: 20, max: 20000 },
  { id: 'dog', name: 'Dog', emoji: '🐕', min: 67, max: 45000 },
  { id: 'cat', name: 'Cat', emoji: '🐈', min: 48, max: 64000 },
  { id: 'bat', name: 'Bat', emoji: '🦇', min: 2000, max: 110000 },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬', min: 75, max: 150000 },
]

export const canHear = (id: string, f: number) => {
  const a = HEARING.find((h) => h.id === id)!
  return f >= a.min && f <= a.max
}

export const classify = (f: number) => (f < 20 ? 'infrasound' : f > 20000 ? 'ultrasound' : 'audible')

/** Time for one complete vibration (seconds). */
export const period = (f: number) => 1 / f

/** Map a slider position 0–1 onto a log scale of frequencies. */
export const logFreq = (x: number, min = 20, max = 20000) => Math.round(min * (max / min) ** x)
export const logPos = (f: number, min = 20, max = 20000) => Math.log(f / min) / Math.log(max / min)
