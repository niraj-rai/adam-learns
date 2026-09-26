/** Rows of a × b as b counts down, to show the pattern that makes (−) × (−) = (+). */
export function ladder(a: number, from = 3, to = -3) {
  const rows: { a: number; b: number; p: number }[] = []
  for (let b = from; b >= to; b--) rows.push({ a, b, p: a * b + 0 })
  return rows
}
export const sign = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '0')

export type Quick = { a: number; b: number; op: '×' | '÷' }
export const QUICK: Quick[] = [
  { a: -6, b: 4, op: '×' },
  { a: -7, b: -3, op: '×' },
  { a: 36, b: -9, op: '÷' },
  { a: -48, b: -6, op: '÷' },
  { a: -1, b: -1, op: '×' },
  { a: 0, b: -5, op: '×' },
  { a: -45, b: 5, op: '÷' },
  { a: 8, b: -8, op: '×' },
]
export const result = (q: Quick) => (q.op === '×' ? q.a * q.b : q.a / q.b) + 0
