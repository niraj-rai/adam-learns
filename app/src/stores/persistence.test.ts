import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Learners' progress lives only in their browser. These tests load data saved by earlier versions of the
 * app and check nothing is lost, so an update can never wipe someone's progress.
 */

function memoryStorage(initial: Record<string, string>) {
  const m = new Map(Object.entries(initial))
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() { return m.size },
    dump: () => Object.fromEntries(m),
  }
}

const saved = (state: unknown, version: number) => JSON.stringify({ state, version })

const PROGRESS = {
  xp: 1395,
  topics: { 'chemistry/matter/density': { lessonDone: true, bestScore: 0.9, attempts: 2, lastSeen: '2026-09-20', masteredAt: '2026-09-20' } },
  badges: ['first-steps'],
  activeDays: ['2026-09-19', '2026-09-20'],
  predictions: 4,
  labsTried: ['density-tower'],
  review: { 'chemistry/matter/density#q3': { topicKey: 'chemistry/matter/density', questionId: 'q3', box: 2, due: '2026-09-23' } },
  labMilestones: ['density-tower:sank'],
}
const PROFILE_OLD = { firstName: 'Adamya', lastName: 'Rai', grade: 9, onboardedAt: '2026-09-26T10:00:00.000Z', check: { warmups: ['physics/motion/speed'] }, schedule: { days: [1, 3, 5], time: 'evening', minutes: 30, subjects: ['physics'] } }
const TIME = { total: 600, days: { '2026-09-26': 600 }, daySubjects: { '2026-09-26': { chemistry: 500 } }, subjects: { chemistry: 500 }, topics: { 'chemistry/matter/density': 400 }, practice: {}, labs: { 'density-tower': 100 }, other: { home: 100 } }

async function load(storage: ReturnType<typeof memoryStorage>) {
  vi.resetModules()
  vi.stubGlobal('localStorage', storage)
  const [{ useProgress }, { useProfile }, { useTime }, { useSettings }] = await Promise.all([
    import('./progress'), import('./profile'), import('./time'), import('./settings'),
  ])
  await Promise.all([useProgress.persist.rehydrate(), useProfile.persist.rehydrate(), useTime.persist.rehydrate(), useSettings.persist.rehydrate()])
  return { useProgress, useProfile, useTime, useSettings }
}

describe('saved learner data survives app updates', () => {
  beforeEach(() => vi.unstubAllGlobals())

  it('keeps progress, profile, time and settings saved by the current version', async () => {
    const storage = memoryStorage({
      'adamlearns-progress': saved(PROGRESS, 1),
      'adamlearns-profile': saved(PROFILE_OLD, 1),
      'adamlearns-time': saved(TIME, 1),
      'adamlearns-settings': saved({ theme: 'dark', sound: false, boardView: 'ib' }, 0),
    })
    const s = await load(storage)
    const p = s.useProgress.getState()
    expect(p.xp).toBe(1395)
    expect(p.topics).toEqual(PROGRESS.topics)
    expect(p.review).toEqual(PROGRESS.review)
    expect(p.badges).toEqual(['first-steps'])
    const pr = s.useProfile.getState()
    expect([pr.firstName, pr.grade, pr.onboardedAt]).toEqual(['Adamya', 9, PROFILE_OLD.onboardedAt])
    expect(pr.check).toEqual(PROFILE_OLD.check)
    expect(pr.schedule?.days).toEqual([1, 3, 5])
    expect(pr.reminders.lead).toBe(15)
    expect(s.useTime.getState().total).toBe(600)
    expect(s.useSettings.getState()).toMatchObject({ theme: 'dark', sound: false })
  })

  it('keeps data saved under an older or newer store version instead of discarding it', async () => {
    const storage = memoryStorage({
      'adamlearns-progress': saved(PROGRESS, 0),
      'adamlearns-profile': saved(PROFILE_OLD, 0),
      'adamlearns-time': saved(TIME, 7),
    })
    const s = await load(storage)
    expect(s.useProgress.getState().xp).toBe(1395)
    expect(s.useProfile.getState().firstName).toBe('Adamya')
    expect(s.useTime.getState().total).toBe(600)
    // and the next save keeps it
    s.useProgress.getState().addXp(5)
    expect(JSON.parse(storage.getItem('adamlearns-progress')!).state.xp).toBe(1400)
  })

  it('starts fresh (without crashing) when saved data is damaged', async () => {
    const storage = memoryStorage({ 'adamlearns-progress': '{not json', 'adamlearns-time': saved({ total: 'lots' }, 1) })
    const s = await load(storage)
    expect(s.useProgress.getState().xp).toBe(0)
    expect(s.useTime.getState().total).toBe(0)
  })
})
