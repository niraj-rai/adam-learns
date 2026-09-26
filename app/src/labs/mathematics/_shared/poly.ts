/** A polynomial in x as coefficients by power: [c, b, a] = a·x² + b·x + c. */
export type Poly = number[]

const trim = (p: Poly) => { const q = [...p]; while (q.length > 1 && q[q.length - 1] === 0) q.pop(); return q }
export const add = (p: Poly, q: Poly) => trim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0)))
export function mul(p: Poly, q: Poly) {
  const out = Array<number>(p.length + q.length - 1).fill(0)
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] += a * b }))
  return trim(out)
}
export const evaluate = (p: Poly, x: number) => p.reduce((s, a, i) => s + a * x ** i, 0)

const SUP = ['', '', '²', '³', '⁴']
/** e.g. [6, -5, 1] → "x² − 5x + 6" */
export function format(p: Poly, v = 'x') {
  const terms: string[] = []
  for (let i = p.length - 1; i >= 0; i--) {
    const a = p[i]
    if (!a) continue
    const abs = Math.abs(a)
    const body = i === 0 ? `${abs}` : `${abs === 1 ? '' : abs}${v}${SUP[i]}`
    terms.push(terms.length === 0 ? (a < 0 ? `−${body}` : body) : `${a < 0 ? '−' : '+'} ${body}`)
  }
  return terms.join(' ') || '0'
}
