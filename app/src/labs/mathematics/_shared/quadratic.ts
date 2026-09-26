/** Roots and features of ax² + bx + c = 0. */
export function quadratic(a: number, b: number, c: number) {
  const D = b * b - 4 * a * c
  const vertex = { x: -b / (2 * a), y: c - (b * b) / (4 * a) }
  const kind = D > 0 ? 'two real roots' : D === 0 ? 'two equal roots' : 'no real roots'
  const roots = D < 0 ? [] : D === 0 ? [-b / (2 * a)] : [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)].sort((p, q) => p - q)
  return { D, vertex, kind, roots, sum: -b / a, product: c / a }
}
