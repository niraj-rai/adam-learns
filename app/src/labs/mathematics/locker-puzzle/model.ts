/** After person k toggles every k-th locker (k = 1..people), which lockers are open? */
export function openLockers(n: number, people = n) {
  const open = Array<boolean>(n + 1).fill(false)
  for (let k = 1; k <= people; k++) for (let j = k; j <= n; j += k) open[j] = !open[j]
  return open.flatMap((o, i) => (o && i > 0 ? [i] : []))
}
