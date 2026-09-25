export type Pops = { grass: number; deer: number; tigers: number }
export type Flags = { patrol: boolean; corridor: boolean }
export type Action = 'patrol' | 'corridor' | 'plant' | 'relocate' | 'none'

/** One year in a forest: grass regrows, deer graze and breed, tigers hunt deer; poachers kill tigers unless there are patrols. */
export function yearStep(p: Pops, f: Flags): Pops {
  const G = p.grass
  const D = p.deer
  const T = p.tigers
  const grass = Math.max(20, Math.min(1000, G + 0.9 * G * (1 - G / 1000) + 40 - (1.3 * D * G) / (G + 200)))
  const births = (0.45 * D * G) / (G + 300)
  const pred = (12 * T * D) / (D + 50)
  const deer = Math.max(0, D + births - 0.1 * D - pred)
  const tigers = Math.max(0, T + 0.02 * pred - 0.15 * T - (f.patrol ? 0 : 0.35 * T) + (f.corridor ? 1 : 0))
  return { grass, deer, tigers }
}

/** Apply a manager's action at the start of a year, then run the year. */
export function applyAction(p: Pops, f: Flags, a: Action): { pops: Pops; flags: Flags } {
  const flags = { ...f, patrol: f.patrol || a === 'patrol', corridor: f.corridor || a === 'corridor' }
  const start = { ...p, grass: p.grass + (a === 'plant' ? 150 : 0), deer: p.deer * (a === 'relocate' ? 0.7 : 1) }
  return { pops: yearStep(start, flags), flags }
}

export const START: Pops = { grass: 500, deer: 260, tigers: 1.5 }
export const healthy = (p: Pops) => p.grass >= 400 && p.grass <= 800 && p.deer >= 80 && p.deer <= 250 && p.tigers >= 4

export function runPlan(plan: Action[], start = START) {
  let pops = start
  let flags: Flags = { patrol: false, corridor: false }
  const history = [pops]
  for (const a of plan) {
    const r = applyAction(pops, flags, a)
    pops = r.pops
    flags = r.flags
    history.push(pops)
  }
  return { pops, history }
}
