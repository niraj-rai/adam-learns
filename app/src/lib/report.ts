import type { ReviewItem, TopicProgress } from '@/stores/progress'
import { MASTERY_THRESHOLD } from './levels'
import { secondsOn, subjectWeekSeconds, topEntries, weekSeconds, type TimeData } from './timeTracking'

export type SubjectSummary = { total: number; mastered: number; started: number; notStarted: number; avgBest: number | null }

/** Mastered / started / not started counts and the average best practice score for a list of topics. */
export function subjectSummary(list: { key: string }[], progress: Record<string, TopicProgress>): SubjectSummary {
  let mastered = 0
  let started = 0
  const scores: number[] = []
  for (const t of list) {
    const p = progress[t.key]
    if (!p) continue
    if (p.masteredAt) mastered++
    else started++
    if (p.attempts > 0) scores.push(p.bestScore)
  }
  const avgBest = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  return { total: list.length, mastered, started, notStarted: list.length - mastered - started, avgBest }
}

export type Attention = { key: string; bestScore: number; attempts: number; due: number; lowScore: boolean }

/**
 * Topics worth another look: practised but not yet at mastery (best score under 80%),
 * or with review questions due. Most urgent first.
 */
export function needsAttention(progress: Record<string, TopicProgress>, review: Record<string, ReviewItem>, today: string): Attention[] {
  const due = new Map<string, number>()
  for (const r of Object.values(review)) if (r.due <= today) due.set(r.topicKey, (due.get(r.topicKey) ?? 0) + 1)
  const keys = new Set([...due.keys(), ...Object.keys(progress)])
  const out: Attention[] = []
  for (const key of keys) {
    const p = progress[key]
    const lowScore = Boolean(p && p.attempts > 0 && !p.masteredAt && p.bestScore < MASTERY_THRESHOLD)
    const d = due.get(key) ?? 0
    if (lowScore || d) out.push({ key, bestScore: p?.bestScore ?? 0, attempts: p?.attempts ?? 0, due: d, lowScore })
  }
  return out.sort((a, b) => Number(b.lowScore) - Number(a.lowScore) || a.bestScore - b.bestScore || b.due - a.due)
}

/** Topics by when they were last studied, most recent first. */
export function recentActivity(progress: Record<string, TopicProgress>, limit = 8): { key: string; p: TopicProgress }[] {
  return Object.entries(progress)
    .filter(([, p]) => p.lastSeen)
    .sort((a, b) => b[1].lastSeen.localeCompare(a[1].lastSeen))
    .slice(0, limit)
    .map(([key, p]) => ({ key, p }))
}

export type TimeSummary = {
  today: number
  week: number
  allTime: number
  /** per subject id, in the order given: seconds this week and all time */
  subjects: { id: string; week: number; allTime: number }[]
  /** the topics with the most time, most first */
  topTopics: { key: string; seconds: number }[]
}

/** Time spent learning (in seconds) for the report: today, this week (Monday to Sunday), all time, per subject. */
export function timeSummary(time: TimeData, today: string, subjectIds: string[], topLimit = 5): TimeSummary {
  const week = subjectWeekSeconds(time, today)
  return {
    today: secondsOn(time, today),
    week: weekSeconds(time, today),
    allTime: time.total,
    subjects: subjectIds.map((id) => ({ id, week: week[id] ?? 0, allTime: time.subjects[id] ?? 0 })),
    topTopics: topEntries(time.topics, topLimit),
  }
}
