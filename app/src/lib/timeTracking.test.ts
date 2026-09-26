import { describe, expect, it } from 'vitest'
import {
  BLUR_GRACE_MS,
  EMPTY_TIME,
  IDLE_MS,
  MAX_CREDIT_MS,
  contextFor,
  credit,
  dailySeries,
  formatDuration,
  newClock,
  normaliseTime,
  prune,
  subjectWeekSeconds,
  tick,
  topEntries,
  touch,
  unitSeconds,
  weekSeconds,
  type Clock,
} from './timeTracking'

const T0 = 1_000_000

describe('active-time clock', () => {
  it('credits elapsed time while active and visible', () => {
    const { ms, clock } = tick(newClock(T0), T0 + 15_000)
    expect(ms).toBe(15_000)
    expect(clock.lastTick).toBe(T0 + 15_000)
  })

  it('caps one heartbeat, so a sleeping laptop adds little', () => {
    const c = touch(newClock(T0), T0 + 60 * 60_000) // activity right after waking
    expect(tick(newClock(T0), T0 + 60 * 60_000).ms).toBe(MAX_CREDIT_MS)
    expect(tick(c, T0 + 60 * 60_000).ms).toBe(MAX_CREDIT_MS)
  })

  it('stops counting after the idle limit and resumes on activity', () => {
    let c = newClock(T0)
    let total = 0
    // heartbeats every 15 s for 5 minutes with no activity
    for (let t = T0 + 15_000; t <= T0 + 5 * 60_000; t += 15_000) {
      const r = tick(c, t)
      total += r.ms
      c = r.clock
    }
    expect(total).toBe(IDLE_MS)
    // activity: tick first (nothing more for the idle gap), then count again
    const r = tick(c, T0 + 5 * 60_000 + 5_000)
    expect(r.ms).toBe(0)
    c = touch(r.clock, T0 + 5 * 60_000 + 5_000)
    expect(tick(c, T0 + 5 * 60_000 + 20_000).ms).toBe(15_000)
  })

  it('never counts while hidden', () => {
    const c = { ...newClock(T0), visible: false }
    expect(tick(c, T0 + 15_000).ms).toBe(0)
  })

  it('stops a short while after the window is blurred', () => {
    let c: Clock = { ...newClock(T0), blurredAt: T0 }
    let total = 0
    for (let t = T0 + 15_000; t <= T0 + 3 * 60_000; t += 15_000) {
      c = touch(c, t) // even with (e.g. scroll-wheel) activity
      const r = tick(c, t)
      total += r.ms
      c = r.clock
    }
    expect(total).toBe(BLUR_GRACE_MS)
  })

  it('handles a clock going backwards', () => {
    expect(tick(newClock(T0), T0 - 5_000).ms).toBe(0)
  })
})

describe('contextFor', () => {
  const labSubject = (id: string) => (id === 'density-tower' ? 'chemistry' : undefined)
  const isSubject = (id: string) => ['chemistry', 'physics'].includes(id)
  it('maps pages to subjects, topics, labs and other', () => {
    expect(contextFor([], labSubject, isSubject)).toEqual({ other: 'home' })
    expect(contextFor(['progress'], labSubject, isSubject)).toEqual({ other: 'progress' })
    expect(contextFor(['labs'], labSubject, isSubject)).toEqual({ other: 'labs' })
    expect(contextFor(['labs', 'density-tower'], labSubject, isSubject)).toEqual({ labId: 'density-tower', subject: 'chemistry', other: undefined })
    expect(contextFor(['labs', 'nope'], labSubject, isSubject)).toMatchObject({ labId: 'nope', other: 'labs' })
    expect(contextFor(['physics'], labSubject, isSubject)).toEqual({ subject: 'physics' })
    expect(contextFor(['physics', 'forces'], labSubject, isSubject)).toEqual({ subject: 'physics' })
    expect(contextFor(['physics', 'forces', 'speed'], labSubject, isSubject)).toEqual({ subject: 'physics', topicKey: 'physics/forces/speed', practice: false })
    expect(contextFor(['physics', 'forces', 'speed', 'practice'], labSubject, isSubject)).toMatchObject({ topicKey: 'physics/forces/speed', practice: true })
  })
})

describe('crediting and summaries', () => {
  let d = credit(EMPTY_TIME, { subject: 'chemistry', topicKey: 'chemistry/matter/density' }, 60, '2026-09-21')
  d = credit(d, { subject: 'chemistry', topicKey: 'chemistry/matter/density', practice: true }, 30, '2026-09-26')
  d = credit(d, { subject: 'chemistry', labId: 'density-tower' }, 120, '2026-09-26')
  d = credit(d, { subject: 'physics', topicKey: 'physics/forces/speed' }, 45, '2026-09-26')
  d = credit(d, { other: 'home' }, 15, '2026-09-20')
  d = credit(d, { other: 'home' }, 0, '2026-09-20')

  it('adds to every matching total', () => {
    expect(d.total).toBe(270)
    expect(d.days).toEqual({ '2026-09-20': 15, '2026-09-21': 60, '2026-09-26': 195 })
    expect(d.subjects).toEqual({ chemistry: 210, physics: 45 })
    expect(d.topics).toEqual({ 'chemistry/matter/density': 90, 'physics/forces/speed': 45 })
    expect(d.practice).toEqual({ 'chemistry/matter/density': 30 })
    expect(d.labs).toEqual({ 'density-tower': 120 })
    expect(d.other).toEqual({ home: 15 })
    expect(d.daySubjects['2026-09-26']).toEqual({ chemistry: 150, physics: 45 })
    expect(EMPTY_TIME.total).toBe(0) // not mutated
  })

  it('sums this week (Monday to Sunday), a daily series and per-subject week totals', () => {
    // 2026-09-26 is a Saturday; its week starts Monday 21st
    expect(weekSeconds(d, '2026-09-26')).toBe(255)
    expect(subjectWeekSeconds(d, '2026-09-26')).toEqual({ chemistry: 210, physics: 45 })
    const s = dailySeries(d, '2026-09-26', 7)
    expect(s).toHaveLength(7)
    expect(s[0]).toEqual({ date: '2026-09-20', seconds: 15 })
    expect(s[6]).toEqual({ date: '2026-09-26', seconds: 195 })
  })

  it('ranks top entries and sums units', () => {
    expect(topEntries(d.subjects, 1)).toEqual([{ key: 'chemistry', seconds: 210 }])
    expect(unitSeconds(d.topics)).toEqual({ 'chemistry/matter': 90, 'physics/forces': 45 })
  })

  it('prunes old day entries but keeps all-time totals', () => {
    const old = credit(d, { subject: 'physics' }, 100, '2026-05-01')
    const p = prune(old, '2026-09-26')
    expect(p.days['2026-05-01']).toBe(100) // daily totals kept for about a year
    expect(p.daySubjects['2026-05-01']).toBeUndefined() // per-subject days for 90
    expect(p.daySubjects['2026-09-21']).toBeDefined()
    expect(p.subjects.physics).toBe(145)
    expect(prune(old, '2027-12-01').days).toEqual({})
  })

  it('normalises stored or imported data', () => {
    expect(normaliseTime(undefined)).toEqual(EMPTY_TIME)
    expect(normaliseTime({ total: 'x', days: { a: 5, b: -1, c: 'no' }, daySubjects: { d: { chemistry: 3.4 } }, labs: [] })).toEqual({ ...EMPTY_TIME, days: { a: 5 }, daySubjects: { d: { chemistry: 3 } } })
    expect(normaliseTime(JSON.parse(JSON.stringify(d)))).toEqual(d)
  })
})

describe('formatDuration', () => {
  it('reads nicely', () => {
    expect(formatDuration(0)).toBe('0 min')
    expect(formatDuration(45)).toBe('45 s')
    expect(formatDuration(60)).toBe('1 min')
    expect(formatDuration(12 * 60 + 59)).toBe('12 min')
    expect(formatDuration(3600)).toBe('1 h')
    expect(formatDuration(3900)).toBe('1 h 5 min')
  })
})
