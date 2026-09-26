/** Arithmetic progression: a, a + d, a + 2d, … */
export const apTerm = (a: number, d: number, n: number) => a + (n - 1) * d
export const apSum = (a: number, d: number, n: number) => (n / 2) * (2 * a + (n - 1) * d)
/** Geometric progression: a, ar, ar², … */
export const gpTerm = (a: number, r: number, n: number) => a * r ** (n - 1)
export const gpSum = (a: number, r: number, n: number) => (r === 1 ? a * n : (a * (r ** n - 1)) / (r - 1))
/** Minimum moves for the Tower of Hanoi with n discs. */
export const hanoi = (n: number) => 2 ** n - 1

/** Mean of grouped data using class midpoints. */
export function groupedMean(classes: { lo: number; hi: number; f: number }[]) {
  const n = classes.reduce((s, c) => s + c.f, 0)
  const sum = classes.reduce((s, c) => s + ((c.lo + c.hi) / 2) * c.f, 0)
  return n ? sum / n : 0
}
