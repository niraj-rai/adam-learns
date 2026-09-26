import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { BADGES, type BadgeId } from '@/lib/badges'
import { MASTERY_THRESHOLD, XP } from '@/lib/levels'
import { localDate, localDateOffset } from '@/lib/dates'
import { useToasts } from './toasts'

export type TopicProgress = {
  lessonDone: boolean
  bestScore: number
  attempts: number
  lastSeen: string
  masteredAt?: string
}

/** Leitner box for spaced review: box 1 → 1 day, 2 → 3 days, 3 → 7 days, 4 → 14 days, 5 → done */
export type ReviewItem = { topicKey: string; questionId: string; box: number; due: string }

const BOX_DAYS = [0, 1, 3, 7, 14, 30]

type ProgressState = {
  xp: number
  topics: Record<string, TopicProgress>
  badges: BadgeId[]
  activeDays: string[]
  predictions: number
  labsTried: string[]
  review: Record<string, ReviewItem>
  labMilestones: string[]

  addXp: (amount: number, reason?: string) => void
  awardBadge: (id: BadgeId) => void
  markActive: () => void
  completeLesson: (topicKey: string) => void
  recordPractice: (topicKey: string, result: { score: number; correctIds: string[]; wrongIds: string[] }) => void
  recordPrediction: () => void
  recordLab: (labId: string) => void
  recordLabMilestone: (milestone: string) => void
  recordReview: (reviewKey: string, correct: boolean) => void
  reset: () => void
  importState: (json: string) => boolean
}

const today = () => localDate()
const addDays = (days: number) => localDateOffset(days)

const initial = {
  xp: 0,
  topics: {},
  badges: [] as BadgeId[],
  activeDays: [] as string[],
  predictions: 0,
  labsTried: [] as string[],
  review: {},
  labMilestones: [] as string[],
}

export function currentStreak(activeDays: string[]): number {
  const set = new Set(activeDays)
  let streak = 0
  const d = new Date()
  // today not yet active still counts yesterday's streak
  if (!set.has(localDate(d))) d.setDate(d.getDate() - 1)
  while (set.has(localDate(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      addXp: (amount, reason) => {
        set((s) => ({ xp: s.xp + amount }))
        if (reason) useToasts.getState().push({ kind: 'xp', title: `+${amount} XP`, body: reason })
      },

      awardBadge: (id) => {
        if (get().badges.includes(id)) return
        set((s) => ({ badges: [...s.badges, id] }))
        const b = BADGES[id]
        useToasts.getState().push({ kind: 'badge', title: `${b.emoji} Badge unlocked: ${b.title}`, body: b.description })
      },

      markActive: () => {
        const d = today()
        if (get().activeDays.includes(d)) return
        set((s) => ({ activeDays: [...s.activeDays, d].slice(-400) }))
        const streak = currentStreak(get().activeDays)
        if (streak >= 3) get().awardBadge('streak-3')
        if (streak >= 7) get().awardBadge('streak-7')
      },

      completeLesson: (topicKey) => {
        const prev = get().topics[topicKey]
        if (prev?.lessonDone) return
        set((s) => ({
          topics: {
            ...s.topics,
            [topicKey]: { bestScore: prev?.bestScore ?? 0, attempts: prev?.attempts ?? 0, masteredAt: prev?.masteredAt, lessonDone: true, lastSeen: today() },
          },
        }))
        get().markActive()
        get().addXp(XP.lessonComplete, 'Lesson complete')
        get().awardBadge('first-lesson')
      },

      recordPractice: (topicKey, { score, correctIds, wrongIds }) => {
        const prev = get().topics[topicKey]
        const wasMastered = Boolean(prev?.masteredAt)
        const mastered = score >= MASTERY_THRESHOLD
        set((s) => {
          const review = { ...s.review }
          for (const id of wrongIds) {
            review[`${topicKey}#${id}`] = { topicKey, questionId: id, box: 1, due: addDays(BOX_DAYS[1]) }
          }
          for (const id of correctIds) delete review[`${topicKey}#${id}`]
          return {
            review,
            topics: {
              ...s.topics,
              [topicKey]: {
                lessonDone: prev?.lessonDone ?? false,
                attempts: (prev?.attempts ?? 0) + 1,
                bestScore: Math.max(prev?.bestScore ?? 0, score),
                lastSeen: today(),
                masteredAt: prev?.masteredAt ?? (mastered ? today() : undefined),
              },
            },
          }
        })
        get().markActive()
        if (mastered && !wasMastered) {
          get().addXp(XP.mastery, 'Topic mastered!')
          get().awardBadge('first-mastery')
        }
        if (score === 1) get().awardBadge('perfect-score')
      },

      recordPrediction: () => {
        set((s) => ({ predictions: s.predictions + 1 }))
        if (get().predictions >= 10) get().awardBadge('predictor')
      },

      recordLab: (labId) => {
        if (get().labsTried.includes(labId)) return
        set((s) => ({ labsTried: [...s.labsTried, labId] }))
        get().addXp(XP.labExplored, 'New lab explored')
        if (get().labsTried.length >= 3) get().awardBadge('lab-explorer')
      },

      recordLabMilestone: (milestone) => {
        if (get().labMilestones.includes(milestone)) return
        set((s) => ({ labMilestones: [...s.labMilestones, milestone] }))
        const m = get().labMilestones
        if (['particles:melt', 'particles:boil', 'particles:freeze'].every((x) => m.includes(x))) {
          get().awardBadge('particle-pro')
        }
      },

      recordReview: (reviewKey, correct) => {
        const item = get().review[reviewKey]
        if (!item) return
        set((s) => {
          const review = { ...s.review }
          const box = correct ? item.box + 1 : 1
          if (box >= BOX_DAYS.length) delete review[reviewKey]
          else review[reviewKey] = { ...item, box, due: addDays(BOX_DAYS[box]) }
          return { review }
        })
        get().markActive()
        if (correct) get().addXp(XP.reviewCorrect)
      },

      reset: () => set({ ...initial }),

      importState: (json) => {
        try {
          const data = JSON.parse(json)
          if (typeof data?.xp !== 'number' || typeof data?.topics !== 'object') return false
          set({ ...initial, ...data })
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'adamlearns-progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        xp: s.xp,
        topics: s.topics,
        badges: s.badges,
        activeDays: s.activeDays,
        predictions: s.predictions,
        labsTried: s.labsTried,
        review: s.review,
        labMilestones: s.labMilestones,
      }),
    },
  ),
)

export const dueReviewItems = (review: Record<string, ReviewItem>) =>
  Object.entries(review)
    .filter(([, r]) => r.due <= today())
    .map(([key, r]) => ({ key, ...r }))
