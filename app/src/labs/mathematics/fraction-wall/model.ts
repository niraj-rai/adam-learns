export const ROWS = [1, 2, 3, 4, 5, 6, 8, 10, 12]

/** Rows of the wall where n/d can be shown exactly, as [row, pieces]. */
export function equivalentsOnWall(n: number, d: number) {
  return ROWS.filter((r) => (n * r) % d === 0).map((r) => [r, (n * r) / d] as const)
}
