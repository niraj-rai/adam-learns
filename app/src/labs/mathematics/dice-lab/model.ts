import { rng } from '../_shared/stats'

/** Roll `n` fair dice with `sides` faces `times` times; return how often each total came up. */
export function simulate(times: number, sides = 6, dice = 1, seed = Date.now()) {
  const r = rng(seed)
  const counts = new Map<number, number>()
  for (let i = 0; i < times; i++) {
    let s = 0
    for (let d = 0; d < dice; d++) s += 1 + Math.floor(r() * sides)
    counts.set(s, (counts.get(s) ?? 0) + 1)
  }
  return counts
}
/** Exact probability of each total for `dice` fair dice. */
export function theory(sides = 6, dice = 1) {
  let dist = new Map<number, number>([[0, 1]])
  for (let d = 0; d < dice; d++) {
    const next = new Map<number, number>()
    for (const [s, p] of dist) for (let f = 1; f <= sides; f++) next.set(s + f, (next.get(s + f) ?? 0) + p / sides)
    dist = next
  }
  return dist
}
