import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_REMINDERS, normaliseReminders, type ReminderSettings } from '@/lib/reminders'
import { normaliseSchedule, type StudySchedule } from '@/lib/schedule'

export const GRADES = [5, 6, 7, 8, 9, 10] as const
export type Grade = (typeof GRADES)[number]

export type SubjectResult = { correct: number; total: number }
export type SkillsCheck = {
  takenAt: string
  results: Record<string, SubjectResult>
  /** topic keys answered wrongly: practise these first */
  warmups: string[]
}

type ProfileState = {
  firstName: string
  lastName: string
  grade: Grade | null
  onboardedAt: string | null
  check: SkillsCheck | null
  /** optional weekly study plan; null until the learner sets one up */
  schedule: StudySchedule | null
  /** study-plan reminders: on/off, how long before, and sound */
  reminders: ReminderSettings
  setName: (firstName: string, lastName: string) => void
  setGrade: (grade: Grade) => void
  finish: (check: SkillsCheck | null) => void
  setSchedule: (schedule: StudySchedule | null) => void
  setReminders: (reminders: ReminderSettings) => void
  clear: () => void
}

const initial = { firstName: '', lastName: '', grade: null, onboardedAt: null, check: null, schedule: null, reminders: DEFAULT_REMINDERS }

/** The learner's name, grade and skills-check result. Stored on this device only. */
export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (firstName, lastName) => set({ firstName: firstName.trim(), lastName: lastName.trim() }),
      // a new grade makes the old warm-ups out of date, so the check is cleared
      setGrade: (grade) => set(get().grade === grade ? { grade } : { grade, check: null }),
      // skipping keeps any earlier check result
      finish: (check) => set({ onboardedAt: get().onboardedAt ?? new Date().toISOString(), check: check ?? get().check }),
      setSchedule: (schedule) => set({ schedule: schedule && normaliseSchedule(schedule) }),
      setReminders: (reminders) => set({ reminders: normaliseReminders(reminders) }),
      clear: () => set({ ...initial }),
    }),
    {
      name: 'adamlearns-profile',
      version: 1,
      // profiles saved before study plans (or reminders) existed lack them: fill in defaults, keep everything else
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<ProfileState>
        return { ...current, ...s, schedule: normaliseSchedule(s.schedule), reminders: normaliseReminders(s.reminders) }
      },
    },
  ),
)

export const isOnboarded = (p: { firstName: string; grade: Grade | null; onboardedAt: string | null }) => Boolean(p.firstName && p.grade && p.onboardedAt)
