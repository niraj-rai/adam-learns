export type Pt = { x: number; y: number }

export const distance = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y)
export const midpoint = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
/** Slope of the line through two points (Infinity if vertical). */
export const slope = (a: Pt, b: Pt) => (b.x === a.x ? Infinity : (b.y - a.y) / (b.x - a.x))

/** Solve a1x + b1y = c1, a2x + b2y = c2. */
export function solve2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) {
  const det = a1 * b2 - a2 * b1
  if (det !== 0) return { kind: 'unique' as const, x: (c1 * b2 - c2 * b1) / det + 0, y: (a1 * c2 - a2 * c1) / det + 0 }
  // parallel or the same line: compare the ratios
  const same = a1 * c2 === a2 * c1 && b1 * c2 === b2 * c1
  return { kind: same ? ('infinite' as const) : ('none' as const) }
}

/** Format a number compactly, using the true minus sign. */
export const fmt = (n: number, dp = 2) => (Number.isInteger(n) ? `${n}` : n.toFixed(dp)).replace('-', '−')
