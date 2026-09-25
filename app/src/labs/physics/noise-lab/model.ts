/** Typical sound levels in decibels (dB). Every +10 dB sounds about twice as loud. */
export const SOUNDS = [
  { id: 'leaves', name: 'Rustling leaves', emoji: '🍃', db: 20 },
  { id: 'whisper', name: 'Whisper', emoji: '🤫', db: 30 },
  { id: 'library', name: 'Quiet library', emoji: '📚', db: 40 },
  { id: 'talk', name: 'Normal conversation', emoji: '🗣️', db: 60 },
  { id: 'mixie', name: 'Mixer grinder', emoji: '🥤', db: 85 },
  { id: 'traffic', name: 'Heavy traffic at a junction', emoji: '🚦', db: 90 },
  { id: 'horn', name: 'Pressure horn up close', emoji: '📯', db: 110 },
  { id: 'speaker', name: 'Loudspeaker at a procession', emoji: '🔊', db: 115 },
  { id: 'cracker', name: 'Bursting cracker at close range', emoji: '🧨', db: 140 },
]

/** Safe daily listening time (hours) using the NIOSH rule: 85 dB for 8 hours, halving for every extra 3 dB. */
export const safeHours = (db: number) => (db <= 85 ? 8 * 2 ** ((85 - db) / 3) : 8 / 2 ** ((db - 85) / 3))

/** India's Noise Pollution (Regulation and Control) Rules, 2000: ambient limits in dB(A). */
export const ZONES = [
  { id: 'silence', name: 'Silence zone (near hospitals, schools, courts)', day: 50, night: 40 },
  { id: 'residential', name: 'Residential area', day: 55, night: 45 },
  { id: 'commercial', name: 'Commercial area', day: 65, night: 55 },
  { id: 'industrial', name: 'Industrial area', day: 75, night: 70 },
]

export const formatHours = (h: number) => (h >= 24 ? 'all day' : h >= 1 ? `${h.toFixed(h < 10 ? 1 : 0)} hours` : h * 60 >= 1 ? `${Math.round(h * 60)} minutes` : `${Math.max(1, Math.round(h * 3600))} seconds`)
