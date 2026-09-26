import { add, div, equal, frac, mul, show, sub, type Frac } from '../_shared/fraction'

/** a·x + b = c·x + d */
export type Eq = { a: Frac; b: Frac; c: Frac; d: Frac }
const F = (n: number, d = 1) => frac(n, d)
export const PROBLEMS: { text: string; eq: Eq }[] = [
  { text: '2x + 3 = 11', eq: { a: F(2), b: F(3), c: F(0), d: F(11) } },
  { text: '5x − 3 = 2x + 12', eq: { a: F(5), b: F(-3), c: F(2), d: F(12) } },
  { text: '3(x − 2) = 12', eq: { a: F(3), b: F(-6), c: F(0), d: F(12) } },
  { text: 'x/3 + 4 = 6', eq: { a: F(1, 3), b: F(4), c: F(0), d: F(6) } },
  { text: '7 − 2x = x + 1', eq: { a: F(-2), b: F(7), c: F(1), d: F(1) } },
  { text: 'x/2 + x/3 = 10', eq: { a: F(5, 6), b: F(0), c: F(0), d: F(10) } },
]
export const addConst = (e: Eq, k: Frac): Eq => ({ ...e, b: add(e.b, k), d: add(e.d, k) })
export const addX = (e: Eq, k: Frac): Eq => ({ ...e, a: add(e.a, k), c: add(e.c, k) })
export const scale = (e: Eq, k: Frac): Eq => ({ a: mul(e.a, k), b: mul(e.b, k), c: mul(e.c, k), d: mul(e.d, k) })
export const solutionOf = (e: Eq) => div(sub(e.d, e.b), sub(e.a, e.c))
const Z = F(0)
const ONE = F(1)
export const isSolved = (e: Eq) =>
  (equal(e.a, ONE) && equal(e.b, Z) && equal(e.c, Z)) || (equal(e.c, ONE) && equal(e.d, Z) && equal(e.a, Z))

function coef(f: Frac) {
  if (f.n === 0) return ''
  const sign = f.n < 0 ? '−' : ''
  const n = Math.abs(f.n)
  return `${sign}${n === 1 ? '' : n}x${f.d === 1 ? '' : `/${f.d}`}`
}
export function side(a: Frac, b: Frac) {
  const xs = coef(a)
  if (!xs) return show(b).replace('-', '−')
  if (b.n === 0) return xs
  return `${xs} ${b.n < 0 ? '−' : '+'} ${show(frac(Math.abs(b.n), b.d))}`
}
export const text = (e: Eq) => `${side(e.a, e.b)} = ${side(e.c, e.d)}`

export type Move = { label: string; apply: (e: Eq) => Eq }
/** Sensible next moves for the current equation (all keep it balanced). */
export function moves(e: Eq): Move[] {
  const out: Move[] = []
  if (e.a.d !== 1 || e.b.d !== 1 || e.c.d !== 1 || e.d.d !== 1) {
    const L = [e.a.d, e.b.d, e.c.d, e.d.d].reduce((x, y) => (x * y) / gcd(x, y))
    out.push({ label: `Multiply both sides by ${L} (clear fractions)`, apply: (q) => scale(q, F(L)) })
  }
  const neg = (f: Frac) => frac(-f.n, f.d)
  const s = (f: Frac) => show(f).replace('-', '−')
  if (e.c.n !== 0) out.push({ label: `${e.c.n > 0 ? 'Subtract' : 'Add'} ${coef(frac(Math.abs(e.c.n), e.c.d))} on both sides`, apply: (q) => addX(q, neg(q.c)) })
  if (e.b.n !== 0) out.push({ label: `${e.b.n > 0 ? 'Subtract' : 'Add'} ${s(frac(Math.abs(e.b.n), e.b.d))} on both sides`, apply: (q) => addConst(q, neg(q.b)) })
  const k = e.a.n !== 0 ? e.a : e.c
  if (e.b.n === 0 && e.c.n === 0 && k.n !== 0 && !equal(k, ONE)) out.push({ label: `${k.d !== 1 && k.n === 1 ? `Multiply both sides by ${k.d}` : `Divide both sides by ${s(k)}`}`, apply: (q) => scale(q, div(ONE, q.a.n !== 0 ? q.a : q.c)) })
  return out
}
function gcd(a: number, b: number): number { return b ? gcd(b, a % b) : a }
