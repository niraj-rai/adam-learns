const RAD = Math.PI / 180

/**
 * Position of the Sun in the sky. lat and dec in degrees, hour = local solar time (12 = noon).
 * Returns altitude (degrees above the horizon) and azimuth (degrees clockwise from north).
 */
export function sunPosition(lat: number, dec: number, hour: number) {
  const H = 15 * (hour - 12) * RAD
  const phi = lat * RAD
  const d = dec * RAD
  const sinAlt = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(H)
  const alt = Math.asin(sinAlt)
  const cosAz = (Math.sin(d) - Math.sin(alt) * Math.sin(phi)) / (Math.cos(alt) * Math.cos(phi))
  let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) / RAD
  if (H > 0) az = 360 - az
  return { alt: alt / RAD, az }
}

/** Length of the shadow of a vertical stick of height h (same units), or Infinity when the Sun is down. */
export const shadowLength = (h: number, altDeg: number) => (altDeg <= 0 ? Infinity : h / Math.tan(altDeg * RAD))
