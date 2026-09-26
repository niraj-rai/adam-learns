/** Split n into a round number and a small adjustment, for mental squaring: 103 → [100, 3], 98 → [100, -2]. */
export function nearRound(n: number) {
  const step = n >= 100 ? 100 : 10
  const r = Math.round(n / step) * step
  return [r, n - r] as const
}
/** (a + b)² = a² + 2ab + b², shown term by term. */
export const squareParts = (a: number, b: number) => [a * a, 2 * a * b, b * b] as const
