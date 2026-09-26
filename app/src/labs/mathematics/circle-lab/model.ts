export const circumference = (r: number, pi = Math.PI) => 2 * pi * r
export const circleArea = (r: number, pi = Math.PI) => pi * r * r

/**
 * Cut a circle into n equal sectors and lay them side by side, alternately pointing up and down.
 * Returns each sector as a list of points (x right, y down); together they approach a πr × r rectangle.
 */
export function wedges(n: number, r: number) {
  const w = (2 * Math.PI * r) / n
  const half = Math.PI / n
  const steps = 8
  return Array.from({ length: n }, (_, i) => {
    const cx = (i * w) / 2 + w / 2
    const arc = Array.from({ length: steps + 1 }, (_, k) => {
      const a = -half + (2 * half * k) / steps
      return i % 2 === 0 ? ([cx + r * Math.sin(a), r - r * Math.cos(a)] as [number, number]) : ([cx + r * Math.sin(a), r * Math.cos(a)] as [number, number])
    })
    const apex: [number, number] = i % 2 === 0 ? [cx, r] : [cx, 0]
    return [apex, ...arc]
  })
}
