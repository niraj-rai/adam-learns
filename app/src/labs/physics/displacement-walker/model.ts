export type Dir = 'N' | 'E' | 'S' | 'W'
const D: Record<Dir, [number, number]> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }
export const path = (steps: Dir[]) => steps.reduce<[number, number][]>((pts, d) => { const [x, y] = pts[pts.length - 1]; return [...pts, [x + D[d][0], y + D[d][1]]] }, [[0, 0]])
export const distance = (steps: Dir[], stepM = 100) => steps.length * stepM
export function displacement(steps: Dir[], stepM = 100) {
  const [x, y] = path(steps).at(-1)!
  const mag = Math.hypot(x, y) * stepM
  const bearing = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360 // clockwise from north
  return { x: x * stepM, y: y * stepM, mag, bearing }
}
const NAMES = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
export const compass = (bearing: number) => NAMES[Math.round(bearing / 45) % 8]
