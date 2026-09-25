export type Water = 'dry' | 'moist' | 'flooded'
export type Temp = 'cold' | 'warm' | 'hot'
export type Pot = { water: Water; temp: Temp; light: boolean }

/**
 * Day on which a bean seed germinates, or null if it doesn't.
 * Seeds need water, air (oxygen) and a suitable temperature. Light is NOT needed to germinate,
 * but a seedling grown in the dark is pale yellow and spindly.
 */
export function germinationDay(p: Pot): number | null {
  if (p.water === 'dry') return null
  if (p.water === 'flooded') return null // no air: seeds under water can't respire
  if (p.temp === 'cold') return null // a fridge at about 4 °C is too cold
  if (p.temp === 'hot') return null // about 50 °C damages the seed
  return 3
}

/** Seedling height (cm) on a given day. Dark-grown seedlings grow taller but thin and yellow. */
export function seedlingHeight(p: Pot, day: number) {
  const g = germinationDay(p)
  if (g === null || day < g) return 0
  const rate = p.light ? 1.5 : 2.4
  return Math.round((day - g) * rate * 10) / 10
}

export const seedlingColour = (p: Pot) => (p.light ? 'green' : 'pale yellow')
