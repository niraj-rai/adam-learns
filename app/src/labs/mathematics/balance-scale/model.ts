/** One pan of the balance: x-bags and unit weights. */
export type Side = { x: number; c: number }
export type Eq = { L: Side; R: Side }

export const PUZZLES: Eq[] = [
  { L: { x: 3, c: 2 }, R: { x: 0, c: 11 } },
  { L: { x: 2, c: 5 }, R: { x: 1, c: 9 } },
  { L: { x: 4, c: 1 }, R: { x: 2, c: 7 } },
  { L: { x: 5, c: 0 }, R: { x: 2, c: 12 } },
  { L: { x: 3, c: 4 }, R: { x: 1, c: 14 } },
  { L: { x: 6, c: 3 }, R: { x: 2, c: 23 } },
]
export const solution = (e: Eq) => (e.R.c - e.L.c) / (e.L.x - e.R.x)

export const canRemoveX = (e: Eq) => e.L.x > 0 && e.R.x > 0
export const canRemoveC = (e: Eq) => e.L.c > 0 && e.R.c > 0
export const removeX = (e: Eq): Eq => ({ L: { ...e.L, x: e.L.x - 1 }, R: { ...e.R, x: e.R.x - 1 } })
export const removeC = (e: Eq): Eq => ({ L: { ...e.L, c: e.L.c - 1 }, R: { ...e.R, c: e.R.c - 1 } })
/** Divide both pans into k equal groups (only if everything splits evenly). */
export const canDivide = (e: Eq, k: number) => k > 1 && [e.L.x, e.L.c, e.R.x, e.R.c].every((v) => v % k === 0) && e.L.x + e.R.x > 0
export const divide = (e: Eq, k: number): Eq => ({ L: { x: e.L.x / k, c: e.L.c / k }, R: { x: e.R.x / k, c: e.R.c / k } })
export const isSolved = (e: Eq) =>
  (e.L.x === 1 && e.L.c === 0 && e.R.x === 0) || (e.R.x === 1 && e.R.c === 0 && e.L.x === 0)
export const show = (s: Side) => [s.x ? `${s.x === 1 ? '' : s.x}x` : '', s.c || !s.x ? `${s.c}` : ''].filter(Boolean).join(' + ')
