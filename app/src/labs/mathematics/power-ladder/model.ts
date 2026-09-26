import { frac, type Frac } from '../_shared/fraction'

/** Powers of `base` from base^from down to base^to, as exact fractions. */
export function ladder(base: number, from = 4, to = -4) {
  const rows: { k: number; v: Frac }[] = []
  for (let k = from; k >= to; k--) rows.push({ k, v: k >= 0 ? frac(base ** k) : frac(1, base ** -k) })
  return rows
}
