export const interior = (n: number) => (180 * (n - 2)) / n
/** Regular n-gons that tile the plane on their own. */
export const tilesAlone = (n: number) => Math.abs(360 / interior(n) - Math.round(360 / interior(n))) < 1e-9
export const vertexSum = (ns: number[]) => ns.reduce((s, n) => s + interior(n), 0)
export const NAMES: Record<number, string> = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 10: 'decagon', 12: 'dodecagon' }
