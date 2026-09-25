export type Day = { sleep: number; active: number; screen: number; junk: number; fruitVeg: number }

/** Recommended ranges for a 13-year-old (WHO and paediatric guidance, simplified). */
export const GOALS = {
  sleep: { min: 9, max: 11, unit: 'hours', tip: 'Teenagers need about 9–11 hours of sleep for growth, memory and mood.' },
  active: { min: 1, max: 3, unit: 'hours', tip: 'At least 60 minutes of moderate-to-vigorous activity every day.' },
  screen: { min: 0, max: 2, unit: 'hours', tip: 'Keep recreational screen time to about 2 hours, and none just before bed.' },
  junk: { min: 0, max: 1, unit: 'servings', tip: 'Fried snacks, sweets and sugary drinks only occasionally.' },
  fruitVeg: { min: 5, max: 10, unit: 'servings', tip: 'Aim for about 5 servings of fruit and vegetables a day.' },
}

export function score(d: Day) {
  const keys = Object.keys(GOALS) as (keyof Day)[]
  const ok = keys.filter((k) => d[k] >= GOALS[k].min && d[k] <= GOALS[k].max)
  return { points: Math.round((ok.length / keys.length) * 100), fix: keys.filter((k) => !ok.includes(k)) }
}

export const hoursUsed = (d: Day) => d.sleep + d.active + d.screen
