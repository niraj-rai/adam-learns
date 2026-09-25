export type Material = { id: string; name: string; emoji: string; colour: string; alpha: number; conductor: boolean }

/** `alpha` is a scaled thermal diffusivity (cells² per lab-second). Ordering follows real values: silver > copper > aluminium >> steel >> glass > wood ≈ plastic. */
export const MATERIALS: Material[] = [
  { id: 'silver', name: 'Silver', emoji: '🥈', colour: '#cbd5e1', alpha: 30, conductor: true },
  { id: 'copper', name: 'Copper', emoji: '🟠', colour: '#ea580c', alpha: 20, conductor: true },
  { id: 'aluminium', name: 'Aluminium', emoji: '🥫', colour: '#9ca3af', alpha: 17, conductor: true },
  { id: 'steel', name: 'Stainless steel', emoji: '🥄', colour: '#64748b', alpha: 4, conductor: true },
  { id: 'glass', name: 'Glass', emoji: '🧪', colour: '#a5f3fc', alpha: 0.15, conductor: false },
  { id: 'wood', name: 'Wood', emoji: '🪵', colour: '#a16207', alpha: 0.04, conductor: false },
  { id: 'plastic', name: 'Plastic', emoji: '🥤', colour: '#22c55e', alpha: 0.04, conductor: false },
]

export const CELLS = 20

/**
 * One time step of heat conduction along a rod (explicit finite differences).
 * Cell 0 sits in the hot liquid and is held at `hot`. The far end is insulated.
 * Every cell also loses a little heat to the surrounding air.
 */
export function stepRod(T: number[], alpha: number, dt: number, hot: number, ambient: number, loss = 0.005): number[] {
  const n = T.length
  // keep alpha·dt ≤ 0.4 for stability by splitting into sub-steps
  const steps = Math.max(1, Math.ceil((alpha * dt) / 0.4))
  const h = dt / steps
  let cur = T.slice()
  cur[0] = hot
  for (let s = 0; s < steps; s++) {
    const next = cur.slice()
    for (let i = 1; i < n; i++) {
      const right = i === n - 1 ? cur[i] : cur[i + 1]
      next[i] = cur[i] + alpha * h * (cur[i - 1] - 2 * cur[i] + right) - loss * h * (cur[i] - ambient)
    }
    next[0] = hot
    cur = next
  }
  return cur
}
