export type Method = { id: string; name: string; emoji: string; growth: number; startFactor: number; note: string }

/** growth: multiplier on the bacterial doubling rate; startFactor: multiplies the starting number of microbes. */
export const METHODS: Method[] = [
  { id: 'room', name: 'Left out in a warm kitchen', emoji: '🌡️', growth: 1, startFactor: 1, note: 'Warm and moist: perfect for microbes.' },
  { id: 'fridge', name: 'Refrigerated (4 °C)', emoji: '🧊', growth: 0.12, startFactor: 1, note: 'Cold slows microbes down a lot, but doesn’t kill them.' },
  { id: 'boil', name: 'Boiled, then covered and cooled', emoji: '♨️', growth: 1, startFactor: 0.001, note: 'Heat kills most microbes, but the survivors (and new ones) grow again at room temperature.' },
  { id: 'boilfridge', name: 'Boiled, then refrigerated', emoji: '♨️🧊', growth: 0.12, startFactor: 0.001, note: 'Kill most microbes, then slow the rest.' },
  { id: 'salt', name: 'Salted / pickled in oil', emoji: '🧂', growth: 0, startFactor: 1, note: 'Salt draws water out of microbes, so they can’t grow: mango and lime pickles last for months.' },
  { id: 'sugar', name: 'Sugar syrup (jam, murabba)', emoji: '🍯', growth: 0, startFactor: 1, note: 'Lots of sugar also draws water out of microbes.' },
  { id: 'dry', name: 'Sun-dried', emoji: '☀️', growth: 0, startFactor: 1, note: 'Microbes need water. Dried papad, aam papad and dried fish last a long time.' },
]

export const SPOILED = 1e7 // microbes per gram
const DOUBLING_HOURS = 0.75 // at a warm room temperature

/** Microbes per gram after `hours`, starting from `start`. Growth levels off at 1e9. */
export function microbesAfter(hours: number, m: Method, start = 1e3) {
  const n = start * m.startFactor * 2 ** ((hours * m.growth) / DOUBLING_HOURS)
  return Math.min(1e9, Math.max(1, n))
}

/** Hours until the food reaches the spoiled level (Infinity if never). */
export function hoursToSpoil(m: Method, start = 1e3) {
  const s = start * m.startFactor
  if (m.growth === 0) return Infinity
  return (Math.log2(SPOILED / s) * DOUBLING_HOURS) / m.growth
}
