import { getAllTopics, getPractice, getSubject, getSubjects, getTopicByKey, type Topic } from '@/content/loader'
import type { Question } from '@/content/schema'
import type { Grade, SkillsCheck } from '@/stores/profile'
import type { TopicProgress } from '@/stores/progress'
import { LABS } from '@/labs/registry'
import { nextRecommended } from './status'

/** School grade a topic belongs to, from its IB tag: PYP 5 = Grade 5, MYP 1 = Grade 6 … MYP 5 = Grade 10. */
export function topicGrade(t: Pick<Topic, 'grades'>): number {
  const { programme, year } = t.grades.ib
  return programme === 'PYP' ? year : programme === 'MYP' ? year + 5 : year + 10
}

export function stageForGrade(g: number) {
  return g <= 5 ? 'G5' : g <= 8 ? 'G6-8' : g === 9 ? 'G9' : 'G10'
}

/** The grade whose topics we show: the learner's own, or the nearest one that has content yet. */
export function effectiveGrade(grade: Grade, subjectId?: string): number {
  const all = getAllTopics().filter((t) => !subjectId || t.subjectId === subjectId)
  const has = (g: number) => all.some((t) => topicGrade(t) === g)
  for (let d = 0; d <= 5; d++) {
    if (has(grade - d)) return grade - d
    if (has(grade + d)) return grade + d
  }
  return grade
}

export type CheckItem = { subjectId: string; topicKey: string; q: Extract<Question, { type: 'mcq' }> }

/** Options like "both of the above" depend on their order, so we don't shuffle those questions. */
const ORDERED = /\b(above|below|both|neither|all of|none of)\b/i
/** Questions about a lab or the lesson need that context, so leave them out of the check. */
const NAMED_TOOL = /\b(In|Using|With|On|From) the [A-Z]\w+|\b([Bb]uilder|[Ee]xplorer|[Ss]imulator|[Gg]rapher|[Ss]andbox)\b/
const NEEDS_CONTEXT = new RegExp(`\\b(lab|simulation|lesson|video|diagram|${LABS.map((l) => l.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'i')

/**
 * A short skills check: a few questions per subject from the two grades before the learner's
 * (their prerequisites). With no earlier content, it uses the easiest topics of their own grade.
 */
export function buildSkillsCheck(grade: Grade, perSubject = 3, rand: () => number = Math.random): CheckItem[] {
  const items: CheckItem[] = []
  for (const s of getSubjects()) {
    const g = effectiveGrade(grade, s.id)
    const ts = s.units.flatMap((u) => u.topics).filter((t) => t.hasPractice)
    let pool = ts.filter((t) => topicGrade(t) < g && topicGrade(t) >= g - 2)
    if (!pool.length) pool = ts.filter((t) => topicGrade(t) === g && (t.level === 'L0' || t.level === 'L1'))
    if (!pool.length) pool = ts.filter((t) => topicGrade(t) === g)
    // spread across units: one topic per unit first, core topics before extensions
    const byUnit = new Map<string, Topic[]>()
    for (const t of pool) byUnit.set(t.unitId, [...(byUnit.get(t.unitId) ?? []), t])
    const units = [...byUnit.values()].map((list) => list.sort((a, b) => Number(b.core) - Number(a.core) || rand() - 0.5)).sort(() => rand() - 0.5)
    const picked: Topic[] = []
    for (let round = 0; picked.length < perSubject && units.some((u) => u.length > round); round++) {
      for (const u of units) if (u[round] && picked.length < perSubject) picked.push(u[round])
    }
    for (const t of picked) {
      const mcqs = (getPractice(t.key)?.questions ?? []).filter((q): q is CheckItem['q'] => q.type === 'mcq' && q.difficulty <= 2 && !NEEDS_CONTEXT.test(q.prompt) && !NAMED_TOOL.test(q.prompt))
      if (!mcqs.length) continue
      const q = mcqs[Math.floor(rand() * mcqs.length)]
      items.push({ subjectId: s.id, topicKey: t.key, q: ORDERED.test(q.options.join(' ')) ? q : shuffleOptions(q, rand) })
    }
  }
  return items
}

function shuffleOptions(q: CheckItem['q'], rand: () => number): CheckItem['q'] {
  const order = q.options.map((_, i) => i).sort(() => rand() - 0.5)
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer), feedback: undefined }
}

export function scoreSkillsCheck(items: CheckItem[], answers: (number | null)[]): SkillsCheck {
  const results: SkillsCheck['results'] = {}
  const warmups: string[] = []
  items.forEach((it, i) => {
    if (i >= answers.length) return // not reached (skipped the rest)
    const r = (results[it.subjectId] ??= { correct: 0, total: 0 })
    r.total++
    if (answers[i] === it.q.answer) r.correct++
    else warmups.push(it.topicKey)
  })
  return { takenAt: new Date().toISOString(), results, warmups: [...new Set(warmups)] }
}

export function strength(r: { correct: number; total: number }) {
  const p = r.total ? r.correct / r.total : 0
  if (p >= 0.67) return { label: 'Strong', emoji: '💪', cls: 'bg-success-soft text-success' }
  if (p >= 0.34) return { label: 'Getting there', emoji: '🌱', cls: 'bg-warn-soft text-foreground' }
  return { label: 'Warm up first', emoji: '🔧', cls: 'bg-brand-soft text-brand' }
}

/** Topics for the learner's grade in one subject, in curriculum order. */
export function gradeTopics(subjectId: string, grade: Grade): Topic[] {
  const g = effectiveGrade(grade, subjectId)
  return (getSubject(subjectId)?.units ?? []).flatMap((u) => u.topics).filter((t) => topicGrade(t) === g)
}

export function pendingWarmups(check: SkillsCheck | null, topics: Record<string, TopicProgress>): Topic[] {
  return (check?.warmups ?? []).map(getTopicByKey).filter((t): t is Topic => Boolean(t && !topics[t.key]?.masteredAt))
}

/** What to study next: warm-ups first, then the learner's own grade (most recent subject first). */
export function nextForLearner(topics: Record<string, TopicProgress>, grade: Grade | null, check: SkillsCheck | null): { topic?: Topic; warmup: boolean } {
  if (!grade) return { topic: nextRecommended(topics), warmup: false }
  const warm = pendingWarmups(check, topics)[0]
  if (warm) return { topic: warm, warmup: true }
  const recent = Object.entries(topics).sort((a, b) => (b[1].lastSeen ?? '').localeCompare(a[1].lastSeen ?? ''))[0]
  const recentSubject = recent && getTopicByKey(recent[0])?.subjectId
  const order = getSubjects().map((s) => s.id).sort((a, b) => Number(b === recentSubject) - Number(a === recentSubject))
  for (const sid of order) {
    const list = gradeTopics(sid, grade)
    const t = list.find((x) => x.core && !topics[x.key]?.masteredAt) ?? list.find((x) => !topics[x.key]?.masteredAt)
    if (t) return { topic: t, warmup: false }
  }
  return { topic: nextRecommended(topics), warmup: false }
}
