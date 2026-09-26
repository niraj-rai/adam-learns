import { rng } from '../_shared/stats'

/** Heights (cm) of a class of 40 Grade 8 students: made-up but realistic. */
export function classHeights(seed = 8) {
  const r = rng(seed)
  return Array.from({ length: 40 }, () => {
    const z = (r() + r() + r() + r() - 2) * 1.7 // roughly normal
    return Math.round(152 + z * 8)
  })
}
/** Group data into class intervals [start, start + width), [start + width, …). */
export function groupData(xs: number[], width: number, start = Math.floor(Math.min(...xs) / width) * width) {
  const bins: { from: number; to: number; count: number }[] = []
  for (let f = start; f <= Math.max(...xs); f += width) bins.push({ from: f, to: f + width, count: xs.filter((x) => x >= f && x < f + width).length })
  return bins
}
/** Tally marks as groups of five plus leftover single strokes. */
export const tally = (n: number) => ({ fives: Math.floor(n / 5), ones: n % 5 })
