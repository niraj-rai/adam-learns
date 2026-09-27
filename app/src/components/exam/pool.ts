import { getPractice, getSubject, type Unit } from '@/content/loader'
import type { Question } from '@/content/schema'
import type { PoolItem } from '@/lib/exam'
import { topicGrade } from '@/lib/learner'

/** Units of a subject that have topics for this grade. */
export const unitsForGrade = (subjectId: string, grade: number): Unit[] =>
  (getSubject(subjectId)?.units ?? []).filter((u) => u.topics.some((t) => topicGrade(t) === grade))

/** Every practice question in the chosen units at this grade. */
export function examPool(subjectId: string, grade: number, unitIds: string[]): PoolItem[] {
  return unitsForGrade(subjectId, grade)
    .filter((u) => unitIds.includes(u.id))
    .flatMap((u) => u.topics.filter((t) => topicGrade(t) === grade))
    .flatMap((t) => (getPractice(t.key)?.questions ?? []).map((q) => ({ topicKey: t.key, q })))
}

/** Look up a question on a paper; undefined if it has been removed since. */
export const findQuestion = (topicKey: string, id: string): Question | undefined => getPractice(topicKey)?.questions.find((q) => q.id === id)
