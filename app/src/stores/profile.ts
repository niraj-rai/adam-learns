import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  setName: (firstName: string, lastName: string) => void
  setGrade: (grade: Grade) => void
  finish: (check: SkillsCheck | null) => void
  clear: () => void
}

const initial = { firstName: '', lastName: '', grade: null, onboardedAt: null, check: null }

/** The learner's name, grade and skills-check result. Stored on this device only. */
export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (firstName, lastName) => set({ firstName: firstName.trim(), lastName: lastName.trim() }),
      setGrade: (grade) => set({ grade }),
      // skipping keeps any earlier check result
      finish: (check) => set({ onboardedAt: get().onboardedAt ?? new Date().toISOString(), check: check ?? get().check }),
      clear: () => set({ ...initial }),
    }),
    { name: 'adamlearns-profile', version: 1 },
  ),
)

export const isOnboarded = (p: { firstName: string; grade: Grade | null; onboardedAt: string | null }) => Boolean(p.firstName && p.grade && p.onboardedAt)
