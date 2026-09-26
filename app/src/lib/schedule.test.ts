import { describe, expect, it } from 'vitest'
import { activeInLast, dayOfWeek, formatMinutes, isStudyDay, nextStudyDay, normaliseSchedule, planSubjects, weekAdherence, weekDates, type StudySchedule } from './schedule'

// 2026-09-23 is a Wednesday
const plan: StudySchedule = { days: [1, 3, 5], time: 'afternoon', start: '16:30', minutes: 30, subjects: [], dayReminders: {}, updatedAt: '2026-09-01T00:00:00Z' }

describe('schedule', () => {
  it('knows the day of the week and study days', () => {
    expect(dayOfWeek('2026-09-23')).toBe(3)
    expect(isStudyDay(plan, '2026-09-23')).toBe(true)
    expect(isStudyDay(plan, '2026-09-24')).toBe(false)
    expect(isStudyDay(null, '2026-09-23')).toBe(false)
  })

  it('lists the week from Monday to Sunday', () => {
    expect(weekDates('2026-09-23')).toEqual(['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'])
    // a Sunday belongs to the week that started the Monday before
    expect(weekDates('2026-09-27')[0]).toBe('2026-09-21')
    // across a month end
    expect(weekDates('2026-10-01')[0]).toBe('2026-09-28')
  })

  it('measures this week against the plan', () => {
    const a = weekAdherence(plan, ['2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23'], '2026-09-23')
    expect(a.planned).toBe(3)
    expect(a.plannedSoFar).toBe(2) // Mon and Wed, Fri is still ahead
    expect(a.plannedDone).toBe(2)
    expect(a.studied).toBe(3) // Sunday 20th is last week
    expect(a.days.find((d) => d.isToday)?.date).toBe('2026-09-23')
    expect(a.days.filter((d) => d.future)).toHaveLength(4)
  })

  it('counts active days in a window', () => {
    const days = ['2026-09-01', '2026-09-20', '2026-09-22', '2026-09-23', '2026-09-23']
    expect(activeInLast(days, 7, '2026-09-23')).toBe(3)
    expect(activeInLast(days, 30, '2026-09-23')).toBe(4)
  })

  it('finds the next study day', () => {
    expect(nextStudyDay(plan, '2026-09-23')).toBe('2026-09-25')
    expect(nextStudyDay(plan, '2026-09-25')).toBe('2026-09-28')
    expect(nextStudyDay({ ...plan, days: [] }, '2026-09-25')).toBeUndefined()
  })

  it('uses all subjects when none are picked, in the given order', () => {
    expect(planSubjects(plan, ['physics', 'chemistry'])).toEqual(['physics', 'chemistry'])
    expect(planSubjects({ ...plan, subjects: ['chemistry', 'gone'] }, ['physics', 'chemistry'])).toEqual(['chemistry'])
  })

  it('formats minutes', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(120)).toBe('2 h')
    expect(formatMinutes(150)).toBe('2 h 30 min')
  })

  it('checks saved or imported plans', () => {
    expect(normaliseSchedule(null)).toBeNull()
    expect(normaliseSchedule({ days: [] })).toBeNull()
    expect(normaliseSchedule({ days: [9, 2, 2, 'x'], time: 'noon', minutes: 'lots' })).toMatchObject({ days: [2], time: 'afternoon', minutes: 30, subjects: [] })
    expect(normaliseSchedule(plan)).toEqual(plan)
  })

  it('upgrades plans saved before start times and reminders', () => {
    const old = { days: [1], time: 'evening', minutes: 20, subjects: [], updatedAt: 'x' }
    expect(normaliseSchedule(old)).toMatchObject({ time: 'evening', start: '19:00', dayReminders: {} })
    // an exact start decides the time of day; bad times fall back
    expect(normaliseSchedule({ ...old, start: '07:45' })).toMatchObject({ time: 'morning', start: '07:45' })
    expect(normaliseSchedule({ ...old, start: '25:00' })).toMatchObject({ start: '19:00' })
    // overrides only for planned days, only valid values
    expect(normaliseSchedule({ ...old, days: [1, 2], dayReminders: { 1: 5, 2: 'off', 3: 10, 4: 7 } })?.dayReminders).toEqual({ 1: 5, 2: 'off' })
  })
})
