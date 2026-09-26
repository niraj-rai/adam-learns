export type P = [number, number]
const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1])
/** Angle at the first vertex, in degrees, by the cosine rule. */
function angleAt(a: P, b: P, c: P) {
  const ab = dist(a, b)
  const ac = dist(a, c)
  const bc = dist(b, c)
  return (Math.acos(Math.max(-1, Math.min(1, (ab ** 2 + ac ** 2 - bc ** 2) / (2 * ab * ac)))) * 180) / Math.PI
}
export function measure([A, B, C]: [P, P, P]) {
  const angles = [angleAt(A, B, C), angleAt(B, C, A), angleAt(C, A, B)]
  const sides = [dist(B, C), dist(C, A), dist(A, B)]
  return { angles, sides }
}
export function classify(angles: number[], sides: number[]) {
  const r = angles.map((a) => Math.round(a))
  const byAngle = r.some((a) => a === 90) ? 'right-angled' : r.some((a) => a > 90) ? 'obtuse-angled' : 'acute-angled'
  const s = sides.map((x) => Math.round(x * 10) / 10)
  const eq = (i: number, j: number) => Math.abs(s[i] - s[j]) < 0.15
  const bySide = eq(0, 1) && eq(1, 2) ? 'equilateral' : eq(0, 1) || eq(1, 2) || eq(0, 2) ? 'isosceles' : 'scalene'
  return { byAngle, bySide }
}
/** Triangle inequality: each side shorter than the other two together. */
export const canForm = (a: number, b: number, c: number) => a + b > c && a + c > b && b + c > a

/** Round angles to whole degrees so they still add to exactly 180 (largest remainders get rounded up). */
export function roundTo180(angles: number[]) {
  const fl = angles.map(Math.floor)
  let left = 180 - fl.reduce((a, b) => a + b, 0)
  const order = angles.map((a, i) => [a - Math.floor(a), i] as const).sort((x, y) => y[0] - x[0])
  for (const [, i] of order) if (left-- > 0) fl[i] += 1
  return fl
}
