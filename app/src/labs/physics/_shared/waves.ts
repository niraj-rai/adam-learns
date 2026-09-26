/** Sound waves: small pure helpers for the Grade 9 sound labs. */

/** Speed of sound (m/s), NCERT-style values. */
export const SPEED = { air: 344, water: 1498, seaWater: 1531, steel: 5960 } as const

export const waveSpeed = (f: number, wavelength: number) => f * wavelength
export const wavelength = (v: number, f: number) => v / f
export const period = (f: number) => 1 / f

/** The brain keeps a sound for about 0.1 s, so an echo is heard separately only after at least this delay. */
export const PERSISTENCE = 0.1
export const echoTime = (distance: number, v: number = SPEED.air) => (2 * distance) / v
export const distanceFromEcho = (t: number, v: number = SPEED.air) => (v * t) / 2
export const minEchoDistance = (v: number = SPEED.air) => (v * PERSISTENCE) / 2

export type Listener = { name: string; emoji: string; lo: number; hi: number }
/** Approximate hearing ranges (Hz). */
export const LISTENERS: Listener[] = [
  { name: 'Elephant', emoji: '🐘', lo: 14, hi: 12000 },
  { name: 'Human', emoji: '🧒', lo: 20, hi: 20000 },
  { name: 'Dog', emoji: '🐕', lo: 67, hi: 45000 },
  { name: 'Cat', emoji: '🐈', lo: 45, hi: 64000 },
  { name: 'Bat', emoji: '🦇', lo: 2000, hi: 110000 },
  { name: 'Dolphin', emoji: '🐬', lo: 75, hi: 150000 },
]
export const canHear = (l: Listener, f: number) => f >= l.lo && f <= l.hi
export const band = (f: number) => (f < 20 ? 'infrasound' : f > 20000 ? 'ultrasound' : 'audible')
