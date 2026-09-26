import { localDate } from './dates'
import { isLead, type DayReminder } from './reminders'
/** A simple weekly study plan. Days use JS numbering: 0 = Sunday … 6 = Saturday. */
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'
export type StudySchedule = {
  days: number[]
  time: TimeOfDay
  /** start time on the 24-hour clock, "HH:MM" (local time); older plans get their time of day's usual start */
  start: string
  minutes: number
  /** subject ids to focus on; empty means all subjects */
  subjects: string[]
  /** per-day reminder overrides by day number; a missing day uses the plan's default reminder */
  dayReminders: Partial<Record<number, DayReminder>>
  updatedAt: string
}

export const TIMES: { id: TimeOfDay; label: string; emoji: string }[] = [
  { id: 'morning', label: 'Morning', emoji: '🌅' },
  { id: 'afternoon', label: 'After school', emoji: '🎒' },
  { id: 'evening', label: 'Evening', emoji: '🌙' },
]
/** The usual start time for each time of day, used when a plan has no exact time yet. */
export const TIME_START: Record<TimeOfDay, string> = { morning: '07:00', afternoon: '16:30', evening: '19:00' }
/** Which time of day a start time falls in. */
export const timeOfDay = (hhmm: string): TimeOfDay => (hhmm < '12:00' ? 'morning' : hhmm < '18:00' ? 'afternoon' : 'evening')
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/
export const isClock = (x: unknown): x is string => typeof x === 'string' && CLOCK.test(x)

export const MINUTES = [15, 20, 30, 45, 60] as const
/** Monday first, the way school weeks are shown. */
export const WEEK = [1, 2, 3, 4, 5, 6, 0] as const
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Today as YYYY-MM-DD, the same way the progress store records active days. */
export const todayIso = () => localDate()

const parse = (iso: string) => new Date(`${iso}T00:00:00Z`)
const fmt = (d: Date) => d.toISOString().slice(0, 10)
export const shiftIso = (iso: string, days: number) => fmt(new Date(parse(iso).getTime() + days * 86_400_000))

export const dayOfWeek = (iso: string) => parse(iso).getUTCDay()

export const isStudyDay = (s: StudySchedule | null | undefined, iso: string) => Boolean(s?.days.includes(dayOfWeek(iso)))

/** The seven dates (Monday to Sunday) of the week that contains `iso`. */
export function weekDates(iso: string): string[] {
  const back = (dayOfWeek(iso) + 6) % 7 // days since Monday
  const monday = shiftIso(iso, -back)
  return Array.from({ length: 7 }, (_, i) => shiftIso(monday, i))
}

export type WeekDay = { date: string; dow: number; planned: boolean; active: boolean; isToday: boolean; future: boolean }

/** How this week is going: planned study days, days actually studied, and how many planned days are done. */
export function weekAdherence(s: StudySchedule | null | undefined, activeDays: string[], iso: string) {
  const active = new Set(activeDays)
  const days: WeekDay[] = weekDates(iso).map((date) => ({
    date,
    dow: dayOfWeek(date),
    planned: isStudyDay(s, date),
    active: active.has(date),
    isToday: date === iso,
    future: date > iso,
  }))
  const planned = days.filter((d) => d.planned).length
  const plannedSoFar = days.filter((d) => d.planned && !d.future).length
  const plannedDone = days.filter((d) => d.planned && d.active).length
  const studied = days.filter((d) => d.active).length
  return { days, planned, plannedSoFar, plannedDone, studied }
}

/** Number of distinct active days in the last `n` days, today included. */
export function activeInLast(activeDays: string[], n: number, iso: string): number {
  const from = shiftIso(iso, -(n - 1))
  return new Set(activeDays.filter((d) => d >= from && d <= iso)).size
}

/** The next planned study day after `iso` (up to a week ahead), or undefined when no days are planned. */
export function nextStudyDay(s: StudySchedule | null | undefined, iso: string): string | undefined {
  for (let i = 1; i <= 7; i++) {
    const d = shiftIso(iso, i)
    if (isStudyDay(s, d)) return d
  }
  return undefined
}

/** Focus subjects in `order`; an empty list means all of them. */
export function planSubjects(s: StudySchedule, order: string[]): string[] {
  const picked = s.subjects.filter((id) => order.includes(id))
  return picked.length ? order.filter((id) => picked.includes(id)) : order
}

export const weeklyMinutes = (s: StudySchedule) => s.days.length * s.minutes

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
}

/** Checks a schedule read from storage or an imported file; returns null when it is not usable. */
export function normaliseSchedule(x: unknown): StudySchedule | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  const days = Array.isArray(o.days) ? [...new Set(o.days.filter((d): d is number => Number.isInteger(d) && d >= 0 && d <= 6))].sort() : []
  if (!days.length) return null
  // an exact start time decides the time of day; older plans only had the time of day
  const time = isClock(o.start) ? timeOfDay(o.start) : TIMES.some((t) => t.id === o.time) ? (o.time as TimeOfDay) : 'afternoon'
  const start = isClock(o.start) ? o.start : TIME_START[time]
  const minutes = typeof o.minutes === 'number' && o.minutes >= 5 && o.minutes <= 180 ? Math.round(o.minutes) : 30
  const subjects = Array.isArray(o.subjects) ? o.subjects.filter((s): s is string => typeof s === 'string') : []
  const dayReminders: StudySchedule['dayReminders'] = {}
  if (o.dayReminders && typeof o.dayReminders === 'object') {
    for (const [k, v] of Object.entries(o.dayReminders)) {
      const d = Number(k)
      if (days.includes(d) && (v === 'off' || isLead(v))) dayReminders[d] = v
    }
  }
  const updatedAt = typeof o.updatedAt === 'string' ? o.updatedAt : new Date().toISOString()
  return { days, time, start, minutes, subjects, dayReminders, updatedAt }
}
