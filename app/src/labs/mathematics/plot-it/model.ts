export type Pt = [number, number]
export function quadrant([x, y]: Pt) {
  if (x === 0 && y === 0) return 'origin'
  if (x === 0) return 'y-axis'
  if (y === 0) return 'x-axis'
  return x > 0 ? (y > 0 ? 'I' : 'IV') : y > 0 ? 'II' : 'III'
}
/** The fourth corner of a parallelogram (and so a rectangle) ABCD, given A, B, C. */
export const fourthCorner = (a: Pt, b: Pt, c: Pt): Pt => [a[0] + c[0] - b[0], a[1] + c[1] - b[1]]
export const SHAPES: { name: string; pts: [Pt, Pt, Pt] }[] = [
  { name: 'rectangle', pts: [[-3, 2], [4, 2], [4, -1]] },
  { name: 'square', pts: [[1, 1], [4, 1], [4, 4]] },
  { name: 'rectangle', pts: [[-4, -3], [-4, 1], [2, 1]] },
  { name: 'parallelogram', pts: [[-2, -2], [3, -2], [5, 1]] },
]
