export const SOLAR_YEAR = 365.2422
export const LUNAR_MONTH = 29.5306
export const LUNAR_YEAR = 12 * LUNAR_MONTH // ≈ 354.37 days

/** How many days a purely lunar calendar falls behind the solar year each year. */
export const driftPerYear = SOLAR_YEAR - LUNAR_YEAR

/** Years for a purely lunar date to move right round all the seasons. */
export const yearsToCycle = SOLAR_YEAR / driftPerYear

/** A lunisolar calendar (like the Hindu calendar) adds a leap month (adhik maas) whenever the drift adds up to a month. */
export const monthsBetweenLeapMonths = (LUNAR_MONTH / driftPerYear) * 12

/** Day of the solar year (0–365) on which a festival falls in a given year, for each calendar type. */
export function festivalDay(kind: 'solar' | 'lunar' | 'lunisolar', startDay: number, year: number) {
  if (kind === 'solar') return startDay
  const d = startDay - driftPerYear * year
  if (kind === 'lunar') return ((d % SOLAR_YEAR) + SOLAR_YEAR) % SOLAR_YEAR
  // lunisolar: each time the drift passes a whole month, a leap month pulls the date forward again
  const back = (driftPerYear * year) % LUNAR_MONTH
  return startDay - back
}
