/** Small seeded random number generator (mulberry32), so simulations can be repeated. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
export function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
export function modes(xs: number[]) {
  const c = new Map<number, number>()
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1)
  const top = Math.max(...c.values())
  return top === 1 ? [] : [...c.entries()].filter(([, n]) => n === top).map(([x]) => x).sort((a, b) => a - b)
}
export const range = (xs: number[]) => Math.max(...xs) - Math.min(...xs)
