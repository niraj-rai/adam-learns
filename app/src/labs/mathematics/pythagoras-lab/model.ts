export const hyp = (a: number, b: number) => Math.hypot(a, b)
export const isRight = (a: number, b: number, c: number) => { const [x, y, z] = [a, b, c].sort((p, q) => p - q); return Math.abs(x * x + y * y - z * z) < 1e-9 }
/** Whole-number triples a < b < c ≤ max with a² + b² = c². */
export function triples(max: number) {
  const out: [number, number, number][] = []
  for (let a = 1; a <= max; a++) for (let b = a + 1; b <= max; b++) { const c = Math.round(hyp(a, b)); if (c <= max && a * a + b * b === c * c) out.push([a, b, c]) }
  return out
}
