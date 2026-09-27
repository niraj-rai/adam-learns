import type { Question } from '@/content/schema'
import { grade, shuffle, type Response } from './grading'

export type ExamFormat = 'cbse' | 'ib'
export type ExamLength = 'short' | 'standard' | 'full'
export type Criterion = 'A' | 'B' | 'C' | 'D'

/** A question available for a paper: where it lives and the question itself. */
export type PoolItem = { topicKey: string; q: Question }
export type PaperItem = { topicKey: string; questionId: string; marks: number }
export type Section = { id: string; title: string; note: string; items: PaperItem[] }
export type Paper = { format: ExamFormat; length: ExamLength; minutes: number; sections: Section[]; totalMarks: number }

export const LENGTHS: Record<ExamLength, { label: string; minutes: number }> = {
  short: { label: 'Quick paper', minutes: 20 },
  standard: { label: 'Standard paper', minutes: 45 },
  full: { label: 'Full paper', minutes: 90 },
}

/** CBSE-style marks: MCQs 1, objective multi-part 2, numericals 2–3, written answers 4–5. */
export function marksFor(q: Question): number {
  switch (q.type) {
    case 'mcq':
    case 'multi-select':
      return 1
    case 'numeric':
      return q.difficulty >= 2 ? 3 : 2
    case 'short-answer':
      return q.difficulty >= 3 ? 5 : 4
    default:
      return 2
  }
}

/** How many questions of each CBSE mark band go into each paper length. */
const CBSE_PLAN: Record<ExamLength, Record<'A' | 'B' | 'C' | 'D', number>> = {
  short: { A: 6, B: 3, C: 2, D: 1 },
  standard: { A: 10, B: 5, C: 4, D: 2 },
  full: { A: 16, B: 7, C: 6, D: 4 },
}
const CBSE_SECTIONS = {
  A: { title: 'Section A', note: 'Objective questions, 1 mark each' },
  B: { title: 'Section B', note: 'Short questions, 2 marks each' },
  C: { title: 'Section C', note: 'Numerical and reasoning questions, 3 marks each' },
  D: { title: 'Section D', note: 'Long answers, 4–5 marks each: write fully, then mark yourself against the scheme' },
} as const
const bandOf = (marks: number): keyof typeof CBSE_SECTIONS => (marks === 1 ? 'A' : marks === 2 ? 'B' : marks === 3 ? 'C' : 'D')

/** IB papers: questions grouped by the criterion they assess. Roughly the marks in each length. */
const IB_TARGET: Record<ExamLength, number> = { short: 22, standard: 42, full: 70 }
export const IB_SECTIONS: Record<Criterion, string> = {
  A: 'Criterion A: Knowing and understanding',
  B: 'Criterion B: Investigating patterns / Inquiring and designing',
  C: 'Criterion C: Communicating / Processing and evaluating',
  D: 'Criterion D: Applying in real-life contexts / Reflecting on the impacts',
}

/** Pick questions spread across topics: take one from each topic in turn. */
function spread(items: PoolItem[], count: number, rand: number): PoolItem[] {
  const byTopic = new Map<string, PoolItem[]>()
  for (const it of shuffle(items, rand)) byTopic.set(it.topicKey, [...(byTopic.get(it.topicKey) ?? []), it])
  const queues = shuffle([...byTopic.values()], rand / 2 + 0.25)
  const out: PoolItem[] = []
  for (let round = 0; out.length < count && queues.some((qs) => qs.length > round); round++)
    for (const qs of queues) if (qs[round] && out.length < count) out.push(qs[round])
  return out
}

const toItem = (p: PoolItem): PaperItem => ({ topicKey: p.topicKey, questionId: p.q.id, marks: marksFor(p.q) })

/** Build a paper from a pool of practice questions. The same seed always gives the same paper. */
export function buildPaper(pool: PoolItem[], format: ExamFormat, length: ExamLength, seed: number): Paper {
  const minutes = LENGTHS[length].minutes
  let sections: Section[]
  if (format === 'cbse') {
    sections = (['A', 'B', 'C', 'D'] as const).map((band, i) => {
      const items = spread(pool.filter((p) => bandOf(marksFor(p.q)) === band), CBSE_PLAN[length][band], (seed * (i + 1)) % 1 || 0.37)
      return { id: band, ...CBSE_SECTIONS[band], items: items.map(toItem) }
    })
  } else {
    // share the marks between criteria in proportion to the questions available for each
    const crits = (['A', 'B', 'C', 'D'] as const).filter((c) => pool.some((p) => p.q.ibCriterion === c))
    const counts = Object.fromEntries(crits.map((c) => [c, pool.filter((p) => p.q.ibCriterion === c).length])) as Record<Criterion, number>
    const all = crits.reduce((s, c) => s + counts[c], 0) || 1
    sections = crits.map((c, i) => {
      const target = Math.max(4, Math.round((IB_TARGET[length] * counts[c]) / all))
      const picked: PoolItem[] = []
      let marks = 0
      for (const p of spread(pool.filter((x) => x.q.ibCriterion === c), 999, (seed * (i + 2)) % 1 || 0.61)) {
        if (marks >= target) break
        picked.push(p)
        marks += marksFor(p.q)
      }
      return { id: c, title: IB_SECTIONS[c], note: 'Marked against the criterion; your level (0–8) is worked out from your marks', items: picked.map(toItem) }
    })
  }
  sections = sections.filter((s) => s.items.length)
  return { format, length, minutes, sections, totalMarks: sections.reduce((s, x) => s + x.items.reduce((a, i) => a + i.marks, 0), 0) }
}

/** Marks earned: objective answers are all-or-nothing, multi-part ones earn part marks, written answers use the self-marked rubric. */
export function marksEarned(q: Question, r: Response | undefined, marks: number): number {
  if (!r) return 0
  const half = (x: number) => Math.round(x * 2) / 2
  switch (q.type) {
    case 'short-answer': {
      const checks = r.type === 'short-answer' ? r.checks : []
      return half((marks * checks.filter(Boolean).length) / (q.rubric.length || 1))
    }
    case 'sort-bins':
    case 'match-pairs':
    case 'order-steps':
    case 'fill-blank': {
      const parts = q.type === 'sort-bins' ? q.items.length : q.type === 'match-pairs' ? q.pairs.length : q.type === 'order-steps' ? q.steps.length : q.blanks.length
      const wrong = grade(q, r).wrongParts.length
      return half((marks * (parts - wrong)) / (parts || 1))
    }
    default:
      return grade(q, r).correct ? marks : 0
  }
}

export type ItemResult = PaperItem & { earned: number; criterion: Criterion; section: string }
export type Tally = { earned: number; total: number }
export type PaperResult = {
  earned: number
  total: number
  sections: Record<string, Tally>
  topics: Record<string, Tally>
  criteria: Partial<Record<Criterion, Tally>>
  items: ItemResult[]
}

export function scorePaper(paper: Paper, find: (topicKey: string, id: string) => Question | undefined, responses: Record<string, Response>): PaperResult {
  const add = (rec: Record<string, Tally>, key: string, e: number, t: number) => {
    rec[key] = { earned: (rec[key]?.earned ?? 0) + e, total: (rec[key]?.total ?? 0) + t }
  }
  const out: PaperResult = { earned: 0, total: 0, sections: {}, topics: {}, criteria: {}, items: [] }
  for (const s of paper.sections)
    for (const it of s.items) {
      const q = find(it.topicKey, it.questionId)
      if (!q) continue // a question removed since the paper was set: leave it out of the total
      const earned = marksEarned(q, responses[itemKey(it)], it.marks)
      out.earned += earned
      out.total += it.marks
      add(out.sections, s.id, earned, it.marks)
      add(out.topics, it.topicKey, earned, it.marks)
      add(out.criteria as Record<string, Tally>, q.ibCriterion, earned, it.marks)
      out.items.push({ ...it, earned, criterion: q.ibCriterion, section: s.id })
    }
  return out
}

export const itemKey = (it: Pick<PaperItem, 'topicKey' | 'questionId'>) => `${it.topicKey}#${it.questionId}`

/** An IB-style achievement level (0–8) from the share of marks for one criterion. */
export const criterionLevel = (t: Tally) => (t.total ? Math.round((8 * t.earned) / t.total) : 0)

/** Approximate MYP grade (1–7) from the criterion levels, scaled to the usual 0–32 total. */
export function mypGrade(levels: number[]): number {
  if (!levels.length) return 1
  const total = (levels.reduce((a, b) => a + b, 0) * 4) / levels.length
  const bounds = [6, 10, 15, 19, 24, 28]
  return 1 + bounds.filter((b) => total >= b).length
}

/** Topics where fewer than 60% of the marks were earned, worst first. */
export const weakTopics = (r: PaperResult) =>
  Object.entries(r.topics)
    .filter(([, t]) => t.total > 0 && t.earned / t.total < 0.6)
    .sort((a, b) => a[1].earned / a[1].total - b[1].earned / b[1].total)
    .map(([k]) => k)
