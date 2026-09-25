/**
 * A ruler clamped to a desk vibrates like a cantilever: frequency ∝ 1 / (overhang length)².
 * Calibrated so a 20 cm overhang of a steel ruler gives about 40 Hz (a low buzz).
 */
export const rulerFrequency = (overhangCm: number) => 40 * (20 / overhangCm) ** 2

export type Source = { id: string; name: string; emoji: string; vibrates: string }
export const SOURCES: Source[] = [
  { id: 'tabla', name: 'Tabla', emoji: '🪘', vibrates: 'the stretched skin (membrane)' },
  { id: 'veena', name: 'Veena / sitar', emoji: '🎸', vibrates: 'the plucked strings' },
  { id: 'flute', name: 'Bansuri (flute)', emoji: '🪈', vibrates: 'the air column inside the tube' },
  { id: 'bell', name: 'Temple bell', emoji: '🔔', vibrates: 'the metal of the bell' },
  { id: 'voice', name: 'Your voice', emoji: '🗣️', vibrates: 'your vocal cords in the voice box (larynx)' },
  { id: 'mosquito', name: 'Mosquito', emoji: '🦟', vibrates: 'its wings, beating hundreds of times a second' },
]
