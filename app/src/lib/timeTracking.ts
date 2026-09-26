import { shiftIso, weekDates } from './schedule'

/**
 * Time spent learning, in whole seconds. Only active time counts: the tab is visible,
 * the window isn't blurred for long, and the learner has touched, typed or scrolled lately.
 */
export type TimeData = {
  /** all-time seconds */
  total: number
  /** seconds per local day (YYYY-MM-DD); kept for about a year */
  days: Record<string, number>
  /** seconds per local day per subject; kept for the last DAY_SUBJECT_KEEP days */
  daySubjects: Record<string, Record<string, number>>
  /** all-time seconds per subject (labs count towards their subject) */
  subjects: Record<string, number>
  /** all-time seconds per topic key (lesson and practice together) */
  topics: Record<string, number>
  /** all-time seconds on each topic's practice page (also included in `topics`) */
  practice: Record<string, number>
  /** all-time seconds per lab id */
  labs: Record<string, number>
  /** all-time seconds on other pages: home, progress, review, labs list … */
  other: Record<string, number>
}

export const EMPTY_TIME: TimeData = { total: 0, days: {}, daySubjects: {}, subjects: {}, topics: {}, practice: {}, labs: {}, other: {} }

/** Where the learner is, for crediting time. */
export type TimeContext = { subject?: string; topicKey?: string; practice?: boolean; labId?: string; other?: string }

/** Idle after this long with no pointer, keyboard, scroll or touch activity. */
export const IDLE_MS = 2 * 60_000
/** A blurred window (another app in front) stops counting after this long. */
export const BLUR_GRACE_MS = 60_000
/** Most one heartbeat can credit, so a sleeping laptop doesn't add hours. */
export const MAX_CREDIT_MS = 30_000
export const HEARTBEAT_MS = 15_000
/** How often pending seconds are written to storage (also on hide, pagehide and unmount). */
export const PERSIST_MS = 60_000
export const DAY_KEEP = 400
export const DAY_SUBJECT_KEEP = 90

/** Activity clock for one tab. Times are ms (Date.now()). */
export type Clock = {
  /** the end of the last credited stretch */
  lastTick: number
  lastActivity: number
  visible: boolean
  /** when the window lost focus, or null while focused */
  blurredAt: number | null
}

export const newClock = (now: number, visible = true): Clock => ({ lastTick: now, lastActivity: now, visible, blurredAt: null })

/**
 * Milliseconds of active time between the last tick and `now`, and the clock moved on to `now`.
 * Counting stops IDLE_MS after the last activity and BLUR_GRACE_MS after a blur, never while
 * hidden, and a single tick credits at most MAX_CREDIT_MS.
 */
export function tick(c: Clock, now: number): { ms: number; clock: Clock } {
  let end = Math.min(now, c.lastActivity + IDLE_MS)
  if (c.blurredAt !== null) end = Math.min(end, c.blurredAt + BLUR_GRACE_MS)
  const ms = c.visible ? Math.max(0, Math.min(end - c.lastTick, MAX_CREDIT_MS)) : 0
  return { ms, clock: { ...c, lastTick: Math.max(c.lastTick, now) } }
}

/**
 * The learner did something. Time already idle is credited only up to IDLE_MS by the tick,
 * so the caller should tick first, then mark activity.
 */
export const touch = (c: Clock, now: number): Clock => ({ ...c, lastActivity: Math.max(c.lastActivity, now) })

/** Where time goes for a page, from its path segments inside the app. */
export function contextFor(segs: string[], labSubject: (id: string) => string | undefined, isSubject: (id: string) => boolean): TimeContext {
  const [a, b, c, d] = segs
  if (!a) return { other: 'home' }
  if (a === 'labs') {
    if (!b) return { other: 'labs' }
    return { labId: b, subject: labSubject(b), other: labSubject(b) ? undefined : 'labs' }
  }
  if (isSubject(a)) {
    if (b && c) return { subject: a, topicKey: `${a}/${b}/${c}`, practice: d === 'practice' }
    return { subject: a }
  }
  return { other: a }
}

const add = (rec: Record<string, number>, key: string | undefined, s: number) => (key ? { ...rec, [key]: (rec[key] ?? 0) + s } : rec)

/** Adds `seconds` of active time in `ctx` on local day `date`. */
export function credit(data: TimeData, ctx: TimeContext, seconds: number, date: string): TimeData {
  if (!(seconds > 0)) return data
  const s = seconds
  return {
    total: data.total + s,
    days: add(data.days, date, s),
    daySubjects: ctx.subject ? { ...data.daySubjects, [date]: add(data.daySubjects[date] ?? {}, ctx.subject, s) } : data.daySubjects,
    subjects: add(data.subjects, ctx.subject, s),
    topics: add(data.topics, ctx.topicKey, s),
    practice: ctx.practice ? add(data.practice, ctx.topicKey, s) : data.practice,
    labs: add(data.labs, ctx.labId, s),
    other: add(data.other, ctx.other, s),
  }
}

/** Drops day entries older than the keep windows; all-time totals stay. */
export function prune(data: TimeData, today: string): TimeData {
  const dayFrom = shiftIso(today, -(DAY_KEEP - 1))
  const subFrom = shiftIso(today, -(DAY_SUBJECT_KEEP - 1))
  const keep = <T,>(rec: Record<string, T>, from: string) => Object.fromEntries(Object.entries(rec).filter(([d]) => d >= from))
  return { ...data, days: keep(data.days, dayFrom), daySubjects: keep(data.daySubjects, subFrom) }
}

const isRecord = (x: unknown): x is Record<string, unknown> => Boolean(x) && typeof x === 'object' && !Array.isArray(x)
const secs = (x: unknown): Record<string, number> => {
  if (!isRecord(x)) return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(x)) if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = Math.round(v)
  return out
}

/** Checks time data read from storage or an imported file; anything unusable becomes empty. */
export function normaliseTime(x: unknown): TimeData {
  if (!isRecord(x)) return { ...EMPTY_TIME }
  const daySubjects: TimeData['daySubjects'] = {}
  if (isRecord(x.daySubjects)) for (const [d, v] of Object.entries(x.daySubjects)) daySubjects[d] = secs(v)
  const total = typeof x.total === 'number' && Number.isFinite(x.total) && x.total > 0 ? Math.round(x.total) : 0
  return { total, days: secs(x.days), daySubjects, subjects: secs(x.subjects), topics: secs(x.topics), practice: secs(x.practice), labs: secs(x.labs), other: secs(x.other) }
}

/* ---- summaries ---- */

export const secondsOn = (data: TimeData, date: string) => data.days[date] ?? 0

/** Seconds in the Monday-to-Sunday week that contains `today`. */
export const weekSeconds = (data: TimeData, today: string) => weekDates(today).reduce((n, d) => n + secondsOn(data, d), 0)

/** The last `n` days ending with `today`, oldest first. */
export const dailySeries = (data: TimeData, today: string, n: number) =>
  Array.from({ length: n }, (_, i) => {
    const date = shiftIso(today, i - (n - 1))
    return { date, seconds: secondsOn(data, date) }
  })

/** Per-subject seconds over a set of days (from the per-day subject totals). */
export function subjectSecondsOn(data: TimeData, dates: string[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const d of dates) for (const [s, v] of Object.entries(data.daySubjects[d] ?? {})) out[s] = (out[s] ?? 0) + v
  return out
}

/** Per-subject seconds this week (Monday to Sunday). */
export const subjectWeekSeconds = (data: TimeData, today: string) => subjectSecondsOn(data, weekDates(today))

/** The biggest entries of a seconds record, largest first. */
export const topEntries = (rec: Record<string, number>, limit: number) =>
  Object.entries(rec)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, seconds]) => ({ key, seconds }))

/** Seconds per unit ("subject/unit"), summed from topic keys. */
export function unitSeconds(topics: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [key, s] of Object.entries(topics)) {
    const unit = key.split('/').slice(0, 2).join('/')
    out[unit] = (out[unit] ?? 0) + s
  }
  return out
}

/** "45 s", "12 min", "1 h 5 min". Under a minute shows seconds; otherwise whole minutes (rounded down). */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  if (!s) return '0 min'
  if (s < 60) return `${s} s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r ? `${h} h ${r} min` : `${h} h`
}
