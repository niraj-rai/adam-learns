const RAD = Math.PI / 180

/** Approximate solar declination (degrees) on day-of-year n (1 = 1 January). */
export const declination = (n: number) => -23.44 * Math.cos(((2 * Math.PI) / 365) * (n + 10))

/** Height of the Sun above the horizon at local noon (degrees) at latitude φ. */
export const noonAltitude = (lat: number, n: number) => 90 - Math.abs(lat - declination(n))

/** Hours of daylight (sunrise to sunset, ignoring refraction) at latitude φ on day n. */
export function dayLength(lat: number, n: number) {
  const x = -Math.tan(lat * RAD) * Math.tan(declination(n) * RAD)
  if (x <= -1) return 24
  if (x >= 1) return 0
  return (2 * Math.acos(x)) / (15 * RAD)
}

export const PLACES = [
  { id: 'blr', name: 'Bengaluru', lat: 12.97 },
  { id: 'del', name: 'Delhi', lat: 28.61 },
  { id: 'leh', name: 'Leh', lat: 34.15 },
  { id: 'eq', name: 'On the Equator', lat: 0 },
  { id: 'lon', name: 'London', lat: 51.5 },
  { id: 'tromso', name: 'Tromsø (Arctic Norway)', lat: 69.65 },
  { id: 'syd', name: 'Sydney', lat: -33.87 },
]

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** Day-of-year for the 21st of each month. */
export const dayOf21st = (m: number) => [21, 52, 80, 111, 141, 172, 202, 233, 264, 294, 325, 355][m]
