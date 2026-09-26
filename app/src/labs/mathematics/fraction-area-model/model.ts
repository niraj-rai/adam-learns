import { div, frac, type Frac } from '../_shared/fraction'

/** How many copies of `b` fit into `a`: whole copies plus the fraction of one more. */
export function fitCount(a: Frac, b: Frac) {
  const q = div(a, b)
  const whole = Math.floor(q.n / q.d)
  return { q, whole, part: frac(q.n - whole * q.d, q.d) }
}
