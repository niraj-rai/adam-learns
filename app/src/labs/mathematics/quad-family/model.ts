export const PROPS = [
  'Both pairs of opposite sides parallel',
  'At least one pair of parallel sides',
  'All sides equal',
  'All angles 90°',
  'Opposite sides equal',
  'Diagonals bisect each other',
  'Diagonals are perpendicular',
  'Diagonals are equal',
  'Two pairs of equal adjacent sides',
] as const
export type Shape = { id: string; name: string; has: boolean[]; pts: [number, number][] }
const S = (id: string, name: string, bits: string, pts: [number, number][]): Shape => ({ id, name, has: bits.split('').map((b) => b === '1'), pts })
export const SHAPES: Shape[] = [
  S('square', 'Square', '111111111', [[0, 0], [4, 0], [4, 4], [0, 4]]),
  S('rectangle', 'Rectangle', '110111010', [[0, 0], [6, 0], [6, 3.5], [0, 3.5]]),
  S('rhombus', 'Rhombus', '111011101', [[0, 0], [4, 0], [6.4, 3.2], [2.4, 3.2]]),
  S('parallelogram', 'Parallelogram', '110011000', [[0, 0], [5, 0], [6.5, 3], [1.5, 3]]),
  S('trapezium', 'Trapezium', '010000000', [[0, 0], [6.5, 0], [5, 3], [1.5, 3]]),
  S('kite', 'Kite', '000000101', [[2.5, 0], [5, 2.2], [2.5, 5.5], [0, 2.2]]),
]
export const interiorSum = (n: number) => (n - 2) * 180
export const interiorEach = (n: number) => interiorSum(n) / n
export const exteriorEach = (n: number) => 360 / n
