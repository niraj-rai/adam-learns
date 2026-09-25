export const OBJECTS = [
  { id: 'nail', name: 'Iron nail', emoji: '📌', magnetic: true },
  { id: 'scissors', name: 'Steel scissors', emoji: '✂️', magnetic: true },
  { id: 'clip', name: 'Steel paper clip', emoji: '📎', magnetic: true },
  { id: 'filings', name: 'Iron filings', emoji: '⚫', magnetic: true },
  { id: 'can', name: 'Aluminium can', emoji: '🥫', magnetic: false },
  { id: 'copper', name: 'Copper wire', emoji: '🟠', magnetic: false },
  { id: 'brass', name: 'Brass key', emoji: '🔑', magnetic: false },
  { id: 'gold', name: 'Gold ring', emoji: '💍', magnetic: false },
  { id: 'comb', name: 'Plastic comb', emoji: '🪮', magnetic: false },
  { id: 'pencil', name: 'Wooden pencil', emoji: '✏️', magnetic: false },
  { id: 'eraser', name: 'Rubber eraser', emoji: '🧽', magnetic: false },
]

/**
 * Magnetic field of a bar magnet modelled as two poles: N at (+a, 0), S at (−a, 0).
 * Returns the field direction (the way a compass's north end points).
 */
export function barField(x: number, y: number, a = 1) {
  let bx = 0
  let by = 0
  for (const [px, q] of [[a, 1], [-a, -1]] as const) {
    const dx = x - px
    const dy = y
    const r3 = Math.max(1e-6, Math.hypot(dx, dy) ** 3)
    bx += (q * dx) / r3
    by += (q * dy) / r3
  }
  return { bx, by }
}

/** Trace a field line from a start point, following the field, until it gets close to the S pole or leaves the box. */
export function fieldLine(x0: number, y0: number, a = 1, step = 0.05, maxSteps = 600, box = 4) {
  const pts: [number, number][] = [[x0, y0]]
  let x = x0
  let y = y0
  for (let i = 0; i < maxSteps; i++) {
    const { bx, by } = barField(x, y, a)
    const m = Math.hypot(bx, by)
    x += (bx / m) * step
    y += (by / m) * step
    pts.push([x, y])
    if (Math.hypot(x + a, y) < 0.08 || Math.abs(x) > box || Math.abs(y) > box) break
  }
  return pts
}
