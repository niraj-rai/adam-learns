import { primeFactors } from '../_shared/number'

/** Ways to split n into two factors, both bigger than 1. */
export function factorPairs(n: number) {
  const out: [number, number][] = []
  for (let a = 2; a * a <= n; a++) if (n % a === 0) out.push([a, n / a])
  return out
}

/** Prime factors of a and b split into only-a, shared and only-b (as multisets). */
export function sharedFactors(a: number, b: number) {
  const pb = primeFactors(b)
  const onlyA: number[] = []
  const both: number[] = []
  for (const p of primeFactors(a)) {
    const i = pb.indexOf(p)
    if (i >= 0) { both.push(p); pb.splice(i, 1) } else onlyA.push(p)
  }
  const prod = (xs: number[]) => xs.reduce((x, y) => x * y, 1)
  return { onlyA, both, onlyB: pb, hcf: prod(both), lcm: prod([...onlyA, ...both, ...pb]) }
}
