import { getPractice, getSubject, type Unit } from '@/content/loader'
import type { Question } from '@/content/schema'
import type { PoolItem } from '@/lib/exam'
import { topicGrade } from '@/lib/learner'

/** Units of a subject that have topics for this grade. */
export const unitsForGrade = (subjectId: string, grade: number): Unit[] =>
  (getSubject(subjectId)?.units ?? []).filter((u) => u.topics.some((t) => topicGrade(t) === grade))

/** Topics in the chosen units at this grade. */
export const examTopicKeys = (subjectId: string, grade: number, unitIds: string[]): string[] =>
  unitsForGrade(subjectId, grade)
    .filter((u) => unitIds.includes(u.id))
    .flatMap((u) => u.topics.filter((t) => topicGrade(t) === grade && t.hasPractice).map((t) => t.key))

/** Every practice question in those topics (their practice sets must be loaded: see usePracticeSets). */
export const examPool = (topicKeys: string[]): PoolItem[] =>
  topicKeys.flatMap((key) => (getPractice(key)?.questions ?? []).map((q) => ({ topicKey: key, q })))

/** Look up a question on a paper; undefined if it has been removed since. */
export const findQuestion = (topicKey: string, id: string): Question | undefined => getPractice(topicKey)?.questions.find((q) => q.id === id)
