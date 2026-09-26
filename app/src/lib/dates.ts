/** The calendar date (YYYY-MM-DD) on this device, in the learner's own time zone. */
export function localDate(d: Date = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** The local date `days` days from today (negative for the past). */
export function localDateOffset(days: number, from: Date = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return localDate(d)
}
