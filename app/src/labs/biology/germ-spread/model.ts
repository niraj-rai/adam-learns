/** Deterministic random numbers so a scenario can be replayed. */
export function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export type Measures = { handwashing: boolean; masks: boolean; ventilation: boolean; stayHome: boolean }

/** Chance that one contact with an infectious classmate passes the germ on, after measures. */
export function transmission(m: Measures) {
  let p = 0.3
  if (m.handwashing) p *= 0.6
  if (m.masks) p *= 0.5
  if (m.ventilation) p *= 0.7
  return p
}

/**
 * A class of 30 on a 6 × 5 grid. Each school day, every infectious pupil meets their neighbours (up, down, left, right).
 * Infectious for 3 days, then recovered. If `stayHome`, pupils who have been ill for a day stay home.
 */
export function simulate(m: Measures, days = 15, seed = 7) {
  const W = 6
  const H = 5
  const r = rng(seed)
  const state = Array(W * H).fill(0) // 0 healthy, >0 days infected, -1 recovered
  state[12] = 1
  const history: number[][] = [state.slice()]
  const p = transmission(m)
  for (let d = 0; d < days; d++) {
    const next = state.slice()
    for (let i = 0; i < state.length; i++) {
      if (state[i] <= 0) continue
      const atSchool = !(m.stayHome && state[i] >= 2)
      if (atSchool) {
        const x = i % W
        const y = Math.floor(i / W)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
          const j = ny * W + nx
          if (state[j] === 0 && next[j] === 0 && r() < p) next[j] = 1
        }
      }
      next[i] = state[i] >= 3 ? -1 : state[i] + 1
    }
    for (let i = 0; i < state.length; i++) state[i] = next[i]
    history.push(state.slice())
  }
  const everInfected = state.filter((s) => s !== 0).length
  return { history, everInfected }
}

/** Average number infected over many runs (for fair comparisons). */
export function averageInfected(m: Measures, runs = 60) {
  let t = 0
  for (let k = 1; k <= runs; k++) t += simulate(m, 15, k * 101).everInfected
  return t / runs
}
