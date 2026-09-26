const SIGMA = 5.67e-8
export const SOLAR_CONSTANT = 1361 // W/m² at the top of the atmosphere

/**
 * One-layer energy-balance model: the surface temperature (°C) for a planet with
 * albedo α and an atmosphere that absorbs a fraction ε of outgoing infrared.
 * T⁴ = S(1 − α) / (4σ(1 − ε/2)).
 */
export function surfaceTemp(albedo: number, emissivity: number, S = SOLAR_CONSTANT) {
  const k = (S * (1 - albedo)) / (4 * SIGMA * (1 - emissivity / 2))
  return Math.pow(k, 0.25) - 273.15
}

/** Warming (°C) from pre-industrial CO₂ (280 ppm), with about 3 °C per doubling. */
export const warmingFromCO2 = (ppm: number, perDoubling = 3) => perDoubling * Math.log2(ppm / 280)

const GTC_PER_PPM = 2.12
const AIRBORNE = 0.45 // share of emitted carbon that stays in the air; oceans and land take the rest

/**
 * Atmospheric CO₂ year by year from 2025 (425 ppm) to 2100. Emissions start at
 * 10 GtC a year and change by `trend` % a year; `forest` GtC a year is taken up by new forests.
 */
export function projectCO2(trend: number, forest = 0, start = 425) {
  const years: { year: number; ppm: number; emissions: number }[] = []
  let ppm = start
  let e = 10
  for (let year = 2025; year <= 2100; year++) {
    years.push({ year, ppm, emissions: e })
    ppm += (e * AIRBORNE - forest) / GTC_PER_PPM
    e = Math.max(0, e * (1 + trend / 100))
  }
  return years
}
