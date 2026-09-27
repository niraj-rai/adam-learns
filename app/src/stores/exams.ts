import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Response } from '@/lib/grading'
import type { Criterion, ExamFormat, ExamLength, Paper, Tally } from '@/lib/exam'

/** A paper being written: saved as you go, so a refresh or closed tab doesn't lose it. */
export type ActiveExam = {
  id: string
  subjectId: string
  grade: number
  title: string
  paper: Paper
  startedAt: number
  /** when time runs out (ms since epoch) */
  deadline: number
  responses: Record<string, Response>
  flagged: string[]
  /** set once the paper is handed in: written answers are then self-marked before the final score */
  submittedAt?: number
}

/** A finished paper, kept for the history and progress report. */
export type ExamRecord = {
  id: string
  subjectId: string
  grade: number
  title: string
  format: ExamFormat
  length: ExamLength
  date: string
  secondsUsed: number
  earned: number
  total: number
  sections: Record<string, Tally>
  topics: Record<string, Tally>
  criteria: Partial<Record<Criterion, Tally>>
  /** each question's marks, for the answer review (older records may not have it) */
  items?: { topicKey: string; questionId: string; marks: number; earned: number }[]
}

type ExamState = {
  active: ActiveExam | null
  history: ExamRecord[]
  /** the paper just finished (not saved): the paper page sends you to its results */
  lastFinished: string | null
  start: (exam: ActiveExam) => void
  answer: (key: string, r: Response) => void
  toggleFlag: (key: string) => void
  submit: () => void
  finish: (record: ExamRecord) => void
  discard: () => void
  replaceHistory: (history: ExamRecord[]) => void
  reset: () => void
}

const HISTORY_LIMIT = 50

const isRecord = (x: unknown): x is ExamRecord => {
  const r = x as ExamRecord
  return !!r && typeof r.id === 'string' && typeof r.subjectId === 'string' && typeof r.earned === 'number' && typeof r.total === 'number'
}
/** Keep only well-formed records, newest first, so damaged or older data can't break the pages. */
export const normaliseHistory = (x: unknown): ExamRecord[] => (Array.isArray(x) ? x.filter(isRecord).slice(0, HISTORY_LIMIT) : [])
const normaliseActive = (x: unknown): ActiveExam | null => {
  const a = x as ActiveExam
  return a && typeof a.id === 'string' && a.paper && Array.isArray(a.paper.sections) && typeof a.deadline === 'number' ? { ...a, responses: a.responses ?? {}, flagged: a.flagged ?? [] } : null
}

export const useExams = create<ExamState>()(
  persist(
    (set, get) => ({
      active: null,
      history: [],
      lastFinished: null,
      start: (exam) => set({ active: exam }),
      // also used after handing in, to tick the self-marking checklist of written answers
      answer: (key, r) => {
        const a = get().active
        if (a) set({ active: { ...a, responses: { ...a.responses, [key]: r } } })
      },
      toggleFlag: (key) => {
        const a = get().active
        if (a) set({ active: { ...a, flagged: a.flagged.includes(key) ? a.flagged.filter((k) => k !== key) : [...a.flagged, key] } })
      },
      submit: () => {
        const a = get().active
        if (a && !a.submittedAt) set({ active: { ...a, submittedAt: Date.now() } })
      },
      finish: (record) => set({ active: null, lastFinished: record.id, history: [record, ...get().history].slice(0, HISTORY_LIMIT) }),
      discard: () => set({ active: null }),
      replaceHistory: (history) => set({ history: normaliseHistory(history) }),
      reset: () => set({ active: null, history: [] }),
    }),
    {
      name: 'adamlearns-exams',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ active: s.active, history: s.history }),
      // Never drop saved exams: migrate keeps any version, merge checks the shape.
      migrate: (saved) => saved as ExamState,
      merge: (saved, current) => {
        const s = (saved ?? {}) as Partial<ExamState>
        return { ...current, active: normaliseActive(s.active), history: normaliseHistory(s.history) }
      },
    },
  ),
)
