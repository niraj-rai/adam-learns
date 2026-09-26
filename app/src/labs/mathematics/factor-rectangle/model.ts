/** Find m, n with m + n = b and m × n = c, so x² + bx + c = (x + m)(x + n). */
export function splitMiddle(b: number, c: number): [number, number] | null {
  const lim = Math.max(1, Math.abs(c))
  for (let m = -lim; m <= lim; m++) {
    const n = b - m
    if (m * n === c && m <= n) return [m, n]
  }
  return null
}
/** Integer pairs whose product is c (for the student to try). */
export function productPairs(c: number) {
  const out: [number, number][] = []
  const lim = Math.max(1, Math.abs(c))
  for (let m = -lim; m <= lim; m++) if (m !== 0 && c % m === 0 && m <= c / m) out.push([m, c / m])
  return c === 0 ? [[0, 0]] as [number, number][] : out
}
