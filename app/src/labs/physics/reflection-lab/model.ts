/** Reflect a direction vector (dx, dy) off a flat mirror whose surface makes angle `mirrorDeg` with the x-axis. */
export function reflect(dx: number, dy: number, mirrorDeg: number) {
  const a = (mirrorDeg * Math.PI) / 180
  // unit normal to the mirror
  const nx = -Math.sin(a)
  const ny = Math.cos(a)
  const dot = dx * nx + dy * ny
  return { dx: dx - 2 * dot * nx, dy: dy - 2 * dot * ny }
}

/** Angle (degrees) between a direction and the mirror's normal: the angle of incidence or reflection. */
export function angleToNormal(dx: number, dy: number, mirrorDeg: number) {
  const a = (mirrorDeg * Math.PI) / 180
  const nx = -Math.sin(a)
  const ny = Math.cos(a)
  const len = Math.hypot(dx, dy)
  return (Math.acos(Math.abs(dx * nx + dy * ny) / len) * 180) / Math.PI
}
