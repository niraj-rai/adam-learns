import { localDate, localDateOffset } from './dates'
import type { StudySchedule } from './schedule'

/** How many minutes before a study session the reminder goes off. */
export const LEADS = [5, 10, 15] as const
export type Lead = (typeof LEADS)[number]
export const DEFAULT_LEAD: Lead = 15

/** Reminder settings for the whole plan. Each study day can override them (see `StudySchedule.dayReminders`). */
export type ReminderSettings = {
  /** master switch: false turns every reminder and start prompt off */
  on: boolean
  lead: Lead
  /** play the chime and the start sound */
  sound: boolean
}

/** A single study day's choice: follow the plan's default, a lead of its own, or no reminder at all. */
export type DayReminder = Lead | 'off'

export const DEFAULT_REMINDERS: ReminderSettings = { on: true, lead: DEFAULT_LEAD, sound: true }

export const isLead = (x: unknown): x is Lead => LEADS.includes(x as Lead)

/** Checks reminder settings read from storage or an imported file, filling gaps with the defaults. */
export function normaliseReminders(x: unknown): ReminderSettings {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>
  return {
    on: typeof o.on === 'boolean' ? o.on : DEFAULT_REMINDERS.on,
    lead: isLead(o.lead) ? o.lead : DEFAULT_LEAD,
    sound: typeof o.sound === 'boolean' ? o.sound : DEFAULT_REMINDERS.sound,
  }
}

/** The lead time for one day of the plan, or null when that day has no reminder. */
export function leadFor(s: StudySchedule, settings: ReminderSettings, dow: number): Lead | null {
  if (!settings.on) return null
  const own = s.dayReminders[dow]
  if (own === 'off') return null
  return own ?? settings.lead
}

/** "16:30" → minutes after midnight. */
export const clockMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** "16:30" → "4:30 pm", the way the learner reads a clock. */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
}

/** After the start time, the "time to start" prompt still shows for this long (e.g. the tab was opened a little late). */
export const START_GRACE_MIN = 10

export type DueReminder = {
  /** unique per session and kind, so each one fires only once */
  key: string
  kind: 'reminder' | 'start'
  /** the session's local date, YYYY-MM-DD */
  date: string
  start: string
  /** whole minutes until the session starts (0 for a start prompt) */
  minutesLeft: number
}

/** The session starting on local date `iso` at `hhmm`, as a Date in this device's time zone. */
function sessionAt(iso: string, hhmm: string): Date {
  const [y, mo, d] = iso.split('-').map(Number)
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(y, mo - 1, d, h, m)
}

/**
 * Which reminders and start prompts should go off at `now`: pure, so the scheduler only has to play them.
 * A reminder is due from `lead` minutes before the start until the start; a start prompt from the start
 * until START_GRACE_MIN later. When both are due only the start prompt is returned. `fired` holds keys
 * already played, so nothing repeats after a reload. Today's and tomorrow's sessions are both checked,
 * so a session just after midnight still gets its reminder the evening before.
 */
export function dueReminders(s: StudySchedule | null | undefined, settings: ReminderSettings, now: Date, fired: ReadonlySet<string>): DueReminder[] {
  if (!s || !settings.on) return []
  const out: DueReminder[] = []
  for (const date of [localDate(now), localDateOffset(1, now)]) {
    const at = sessionAt(date, s.start)
    const dow = at.getDay()
    if (!s.days.includes(dow)) continue
    const lead = leadFor(s, settings, dow)
    if (lead === null) continue
    const left = (at.getTime() - now.getTime()) / 60_000
    const base = `${date}|${s.start}`
    if (left <= 0 && left > -START_GRACE_MIN) {
      if (!fired.has(`${base}|start`)) out.push({ key: `${base}|start`, kind: 'start', date, start: s.start, minutesLeft: 0 })
    } else if (left > 0 && left <= lead) {
      if (!fired.has(`${base}|reminder`)) out.push({ key: `${base}|reminder`, kind: 'reminder', date, start: s.start, minutesLeft: Math.ceil(left) })
    }
  }
  return out
}

/** Keeps only fired keys from `iso` (the local date) and the day before, so the record stays tiny. */
export function pruneFired(keys: Iterable<string>, iso: string): string[] {
  const from = localDateOffset(-1, sessionAt(iso, '12:00'))
  return [...keys].filter((k) => k.slice(0, 10) >= from)
}
