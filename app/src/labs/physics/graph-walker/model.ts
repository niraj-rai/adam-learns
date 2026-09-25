export type Action = 'walk' | 'run' | 'stop' | 'back'
export type Segment = { action: Action; seconds: number }

export const SPEED: Record<Action, number> = { walk: 1, run: 3, stop: 0, back: -1 }
export const ACTION_LABEL: Record<Action, string> = { walk: '🚶 Walk forward (1 m/s)', run: '🏃 Run forward (3 m/s)', stop: '🧍 Stand still', back: '🔙 Walk back (1 m/s)' }
export const TRACK = 20

export const totalTime = (segs: Segment[]) => segs.reduce((a, s) => a + s.seconds, 0)

/** Position (m) at time t (s), clamped to the track. */
export function positionAt(segs: Segment[], t: number) {
  let x = 0
  let left = t
  for (const s of segs) {
    const dt = Math.min(left, s.seconds)
    x = Math.max(0, Math.min(TRACK, x + SPEED[s.action] * dt))
    left -= dt
    if (left <= 0) break
  }
  return x
}

export function sample(segs: Segment[], upTo = totalTime(segs), step = 0.25) {
  const pts: { t: number; x: number }[] = []
  for (let t = 0; t <= upTo + 1e-9; t += step) pts.push({ t: Math.round(t * 100) / 100, x: Math.round(positionAt(segs, t) * 100) / 100 })
  return pts
}

/** The student's walk matches the target if positions agree at every half-second (and the total time matches). */
export function matchesTarget(mine: Segment[], target: Segment[]) {
  const T = totalTime(target)
  if (Math.abs(totalTime(mine) - T) > 1e-9) return false
  for (let t = 0; t <= T + 1e-9; t += 0.5) if (Math.abs(positionAt(mine, t) - positionAt(target, t)) > 0.3) return false
  return true
}

export const CHALLENGES: { title: string; target: Segment[] }[] = [
  { title: 'Walk steadily for 6 seconds', target: [{ action: 'walk', seconds: 6 }] },
  { title: 'Walk, pause, then run', target: [{ action: 'walk', seconds: 4 }, { action: 'stop', seconds: 3 }, { action: 'run', seconds: 2 }] },
  { title: 'Out and back', target: [{ action: 'run', seconds: 3 }, { action: 'back', seconds: 4 }] },
  { title: 'Slow start, fast finish', target: [{ action: 'stop', seconds: 2 }, { action: 'walk', seconds: 3 }, { action: 'run', seconds: 3 }] },
  { title: 'The forgetful walker (went back for his tiffin!)', target: [{ action: 'walk', seconds: 5 }, { action: 'back', seconds: 3 }, { action: 'stop', seconds: 1 }, { action: 'run', seconds: 3 }] },
]
