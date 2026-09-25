/** Approximate speed of sound (m/s) at room temperature. */
export const MEDIA = [
  { id: 'vacuum', name: 'Vacuum (no air)', emoji: '🌌', speed: 0 },
  { id: 'air', name: 'Air', emoji: '💨', speed: 343 },
  { id: 'water', name: 'Water', emoji: '💧', speed: 1480 },
  { id: 'wood', name: 'Wood', emoji: '🪵', speed: 3800 },
  { id: 'steel', name: 'Steel', emoji: '🔩', speed: 5960 },
]

/** Distance to a reflecting surface from the echo time: the sound goes there AND back. */
export const echoDistance = (seconds: number, speed = 343) => (speed * seconds) / 2

/** We hear a separate echo only if it returns at least 0.1 s after the original sound. */
export const MIN_ECHO_TIME = 0.1
export const minEchoDistance = (speed = 343) => echoDistance(MIN_ECHO_TIME, speed)

/** Seconds for sound to travel a distance. */
export const travelTime = (metres: number, speed: number) => (speed > 0 ? metres / speed : Infinity)
