export type Segment = { dur: number; a: number; label: string }
/** Step through piecewise-constant acceleration; returns samples of time, velocity and displacement. */
export function simulate(segs: Segment[], u0 = 0, dt = 0.1) {
  const out: { t: number; v: number; s: number }[] = [{ t: 0, v: u0, s: 0 }]
  let t = 0
  let v = u0
  let s = 0
  for (const g of segs) {
    const n = Math.round(g.dur / dt)
    for (let i = 0; i < n; i++) {
      s += v * dt + 0.5 * g.a * dt * dt
      v += g.a * dt
      t += dt
      out.push({ t: Math.round(t * 1000) / 1000, v: Math.round(v * 1000) / 1000, s: Math.round(s * 1000) / 1000 })
    }
  }
  return out
}
export const PRESETS: { name: string; emoji: string; u0: number; segs: Segment[] }[] = [
  { name: 'Auto-rickshaw trip', emoji: '🛺', u0: 0, segs: [{ dur: 5, a: 2, label: 'speeds up' }, { dur: 5, a: 0, label: 'cruises' }, { dur: 5, a: -2, label: 'brakes' }] },
  { name: 'Ball thrown upwards', emoji: '⚾', u0: 15, segs: [{ dur: 3, a: -10, label: 'rises, then falls' }] },
  { name: 'Metro between stations', emoji: '🚇', u0: 0, segs: [{ dur: 20, a: 1, label: 'accelerates' }, { dur: 30, a: 0, label: 'cruises' }, { dur: 16, a: -1.25, label: 'brakes' }] },
]
