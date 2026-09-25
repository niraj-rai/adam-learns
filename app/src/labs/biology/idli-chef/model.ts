import { curdHours } from '../fermentation-lab/model'
import { hoursToSpoil, METHODS } from '../food-preserver/model'

/** Idli batter fermentation by natural bacteria and yeast: best around 30–32 °C. Returns % rise. */
export function batterRise(tempC: number, hours: number) {
  if (tempC >= 50) return 0
  const act = Math.max(0, 1 - ((tempC - 31) / 12) ** 2)
  return Math.round(160 * (1 - Math.exp(-0.07 * act * hours)))
}
/** Good batter roughly doubles (50–110% rise). Too little: flat, hard idlis. Too much: sour and runny. */
export const batterVerdict = (rise: number) => (rise < 50 ? 'flat' : rise > 110 ? 'sour' : 'perfect')

export const SPOTS = [
  { id: 'fridge', name: 'In the fridge', temp: 4 },
  { id: 'counter', name: 'Kitchen counter on a cool monsoon night', temp: 21 },
  { id: 'oven', name: 'Inside the oven with just the light on', temp: 31 },
  { id: 'stove', name: 'Next to a hot stove', temp: 52 },
]

export const curdReady = (milkTemp: number, starter: boolean, hours: number) => curdHours(milkTemp, starter) <= hours

/** Leftovers are safe to serve the next morning if they don't reach the spoiled level in `hours`. */
export const safeOvernight = (methodId: string, hours = 12) => hoursToSpoil(METHODS.find((m) => m.id === methodId)!) > hours
