export const DISEASES_R0 = [
  { id: 'flu', name: 'Seasonal flu', r0: 1.5 },
  { id: 'covid', name: 'COVID-19 (early variants)', r0: 3 },
  { id: 'polio', name: 'Polio', r0: 6 },
  { id: 'measles', name: 'Measles', r0: 15 },
]

/** Fraction that must be immune to stop sustained spread: 1 − 1/R₀. */
export const herdThreshold = (r0: number) => 1 - 1 / r0

/**
 * Simple SIR model in a town of `pop` people, one step per day. Infectious for about 7 days.
 * `vaccinated` is the fraction immune at the start.
 */
export function sir(r0: number, vaccinated: number, days = 160, pop = 10000) {
  const gamma = 1 / 7
  const beta = r0 * gamma
  let S = pop * (1 - vaccinated) - 10
  let I = 10
  let R = pop * vaccinated
  const out: { day: number; S: number; I: number; R: number }[] = []
  for (let d = 0; d <= days; d++) {
    out.push({ day: d, S: Math.round(S), I: Math.round(I), R: Math.round(R) })
    const newInf = Math.min(S, (beta * S * I) / pop)
    const rec = gamma * I
    S -= newInf
    I += newInf - rec
    R += rec
  }
  const everInfected = Math.round(pop - S - pop * vaccinated)
  const peak = Math.max(...out.map((o) => o.I))
  return { series: out, everInfected, peak }
}
