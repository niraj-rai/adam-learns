import { describe, expect, it } from 'vitest'
import { DEFAULT_REMINDERS, dueReminders, formatClock, leadFor, normaliseReminders, pruneFired, type ReminderSettings } from './reminders'
import type { StudySchedule } from './schedule'

// 2026-09-23 is a Wednesday (day 3). Dates are built in local time, like the scheduler does.
const plan: StudySchedule = { days: [1, 3, 5], time: 'afternoon', start: '16:30', minutes: 30, subjects: [], dayReminders: {}, updatedAt: 'x' }
const on = DEFAULT_REMINDERS
const at = (d: number, h: number, m: number) => new Date(2026, 8, d, h, m)
const none = new Set<string>()
const kinds = (s: StudySchedule | null, r: ReminderSettings, now: Date, fired: Set<string> = none) => dueReminders(s, r, now, fired).map((x) => `${x.kind}:${x.minutesLeft}`)

describe('reminders', () => {
  it('defaults to on, 15 minutes before, with sound', () => {
    expect(normaliseReminders(undefined)).toEqual({ on: true, lead: 15, sound: true })
    expect(normaliseReminders({ on: false, lead: 7, sound: 'yes' })).toEqual({ on: false, lead: 15, sound: true })
    expect(normaliseReminders({ on: true, lead: 5, sound: false })).toEqual({ on: true, lead: 5, sound: false })
  })

  it('fires the default reminder 15 minutes before', () => {
    expect(kinds(plan, on, at(23, 16, 14))).toEqual([])
    expect(kinds(plan, on, at(23, 16, 15))).toEqual(['reminder:15'])
    expect(kinds(plan, on, at(23, 16, 29))).toEqual(['reminder:1'])
    expect(dueReminders(plan, on, at(23, 16, 20), none)[0]).toMatchObject({ key: '2026-09-23|16:30|reminder', date: '2026-09-23', start: '16:30' })
  })

  it('prompts at the start time for a short while', () => {
    expect(kinds(plan, on, at(23, 16, 30))).toEqual(['start:0'])
    expect(kinds(plan, on, at(23, 16, 39))).toEqual(['start:0'])
    expect(kinds(plan, on, at(23, 16, 40))).toEqual([])
  })

  it('uses the chosen lead time', () => {
    const five = { ...on, lead: 5 as const }
    expect(kinds(plan, five, at(23, 16, 20))).toEqual([])
    expect(kinds(plan, five, at(23, 16, 25))).toEqual(['reminder:5'])
  })

  it('lets a single day override the default, or turn it off', () => {
    const p: StudySchedule = { ...plan, dayReminders: { 3: 10, 5: 'off' } }
    expect(leadFor(p, on, 1)).toBe(15)
    expect(leadFor(p, on, 3)).toBe(10)
    expect(leadFor(p, on, 5)).toBeNull()
    expect(kinds(p, on, at(23, 16, 15))).toEqual([]) // Wednesday: 10 minutes
    expect(kinds(p, on, at(23, 16, 20))).toEqual(['reminder:10'])
    expect(kinds(p, on, at(25, 16, 20))).toEqual([]) // Friday: off, no start prompt either
    expect(kinds(p, on, at(25, 16, 30))).toEqual([])
  })

  it('stays quiet when reminders are off or there is no plan', () => {
    expect(kinds(plan, { ...on, on: false }, at(23, 16, 20))).toEqual([])
    expect(kinds(plan, { ...on, on: false }, at(23, 16, 30))).toEqual([])
    expect(kinds(null, on, at(23, 16, 20))).toEqual([])
  })

  it('only fires on planned days', () => {
    expect(kinds(plan, on, at(24, 16, 20))).toEqual([]) // Thursday
    expect(kinds(plan, on, at(21, 16, 20))).toEqual(['reminder:10']) // Monday
  })

  it('does not fire the same reminder twice', () => {
    const fired = new Set(['2026-09-23|16:30|reminder'])
    expect(kinds(plan, on, at(23, 16, 20), fired)).toEqual([])
    // the start prompt is separate
    expect(kinds(plan, on, at(23, 16, 30), fired)).toEqual(['start:0'])
    // moving the start time makes it a new session
    expect(kinds({ ...plan, start: '16:35' }, on, at(23, 16, 25), fired)).toEqual(['reminder:10'])
  })

  it('handles a session just after midnight', () => {
    const late: StudySchedule = { ...plan, start: '00:05', days: [4] } // Thursday 00:05
    const due = dueReminders(late, on, at(23, 23, 55), none) // Wednesday 23:55
    expect(due).toEqual([{ key: '2026-09-24|00:05|reminder', kind: 'reminder', date: '2026-09-24', start: '00:05', minutesLeft: 10 }])
    expect(kinds(late, on, at(24, 0, 5))).toEqual(['start:0'])
    expect(kinds(late, on, at(24, 23, 55))).toEqual([]) // Friday's session is not planned
  })

  it('prunes old fired keys', () => {
    expect(pruneFired(['2026-09-21|16:30|start', '2026-09-22|16:30|start', '2026-09-23|16:30|reminder'], '2026-09-23')).toEqual(['2026-09-22|16:30|start', '2026-09-23|16:30|reminder'])
    expect(pruneFired(['2026-09-30|16:30|start'], '2026-10-01')).toEqual(['2026-09-30|16:30|start'])
  })

  it('formats clock times', () => {
    expect(formatClock('16:30')).toBe('4:30 pm')
    expect(formatClock('00:05')).toBe('12:05 am')
    expect(formatClock('12:00')).toBe('12:00 pm')
    expect(formatClock('07:00')).toBe('7:00 am')
  })
})
