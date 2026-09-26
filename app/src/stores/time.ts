import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { localDate } from '@/lib/dates'
import { EMPTY_TIME, credit, normaliseTime, prune, type TimeContext, type TimeData } from '@/lib/timeTracking'

export type TimeCredit = { ctx: TimeContext; seconds: number; date: string }

type TimeState = TimeData & {
  /** adds a batch of credited seconds in one write */
  addCredits: (credits: TimeCredit[]) => void
  replace: (data: unknown) => void
  reset: () => void
}

const pick = (s: TimeData): TimeData => ({ total: s.total, days: s.days, daySubjects: s.daySubjects, subjects: s.subjects, topics: s.topics, practice: s.practice, labs: s.labs, other: s.other })

/** Time spent learning. Stored on this device only; the TimeTracker fills it in. */
export const useTime = create<TimeState>()(
  persist<TimeState, [], [], TimeData>(
    (set, get) => ({
      ...EMPTY_TIME,
      addCredits: (credits) => {
        if (!credits.length) return
        let data = pick(get())
        for (const c of credits) data = credit(data, c.ctx, c.seconds, c.date)
        set(prune(data, localDate()))
      },
      replace: (data) => set(normaliseTime(data)),
      reset: () => set({ ...EMPTY_TIME }),
    }),
    {
      name: 'adamlearns-time',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: pick,
      // saved data is checked field by field, so a damaged or older entry can't break the page
      merge: (saved, current) => ({ ...current, ...normaliseTime(saved) }),
    },
  ),
)

/** The time data without the actions, e.g. for export. */
export const timeData = (): TimeData => pick(useTime.getState())
