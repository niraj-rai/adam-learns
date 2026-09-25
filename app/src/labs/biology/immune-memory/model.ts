/**
 * Antibody level (arbitrary units) `day` days after meeting a pathogen.
 * First exposure: slow and small (peaks around day 12). Second exposure, thanks to memory cells: fast and large (peaks around day 5).
 */
export function antibodies(day: number, second: boolean) {
  if (day < 0) return 0
  const peakDay = second ? 5 : 12
  const peak = second ? 100 : 20
  const lag = second ? 1 : 5
  if (day < lag) return 0
  const x = (day - lag) / (peakDay - lag)
  return Math.round(peak * x * Math.exp(1 - x) * 10) / 10
}

/** Antibody level needed to fight off the germ before you feel ill. */
export const PROTECTIVE = 40
export const protectedBy = (second: boolean) => Math.max(...Array.from({ length: 30 }, (_, d) => antibodies(d, second))) >= PROTECTIVE
