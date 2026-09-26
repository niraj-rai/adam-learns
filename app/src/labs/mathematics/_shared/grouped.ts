export type Class = { lo: number; hi: number; f: number }

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Mean of grouped data using class marks (direct method). */
export function groupedMean(cs: Class[]) {
  const n = sum(cs.map((c) => c.f))
  return sum(cs.map((c) => ((c.lo + c.hi) / 2) * c.f)) / n
}

/** Median = l + ((n/2 − cf) / f) × h, where the median class contains the (n/2)th value. */
export function groupedMedian(cs: Class[]) {
  const n = sum(cs.map((c) => c.f))
  let cf = 0
  for (const c of cs) {
    if (cf + c.f >= n / 2) return { median: c.lo + ((n / 2 - cf) / c.f) * (c.hi - c.lo), cls: c, cf }
    cf += c.f
  }
  throw new Error('empty')
}

/** Mode = l + ((f1 − f0) / (2f1 − f0 − f2)) × h, using the modal class (highest frequency). */
export function groupedMode(cs: Class[]) {
  let k = 0
  cs.forEach((c, i) => { if (c.f > cs[k].f) k = i })
  const f1 = cs[k].f
  const f0 = cs[k - 1]?.f ?? 0
  const f2 = cs[k + 1]?.f ?? 0
  const h = cs[k].hi - cs[k].lo
  return { mode: cs[k].lo + ((f1 - f0) / (2 * f1 - f0 - f2)) * h, cls: cs[k] }
}

/** Cumulative "less than" frequencies for an ogive. */
export const cumulative = (cs: Class[]) => cs.reduce<number[]>((acc, c) => [...acc, (acc.at(-1) ?? 0) + c.f], [])
