import { describe, expect, it } from 'vitest'
import { getAllTopics } from '@/content/loader'
import { buildSkillsCheck, effectiveGrade, gradeTopics, nextForLearner, scoreSkillsCheck, topicGrade } from './learner'
import { rng } from '@/labs/mathematics/_shared/stats'

describe('learner', () => {
  it('maps IB years to school grades', () => {
    expect(topicGrade({ grades: { ib: { programme: 'MYP', year: 3 } } } as never)).toBe(8)
    expect(topicGrade({ grades: { ib: { programme: 'PYP', year: 5 } } } as never)).toBe(5)
  })

  it('builds a skills check from earlier grades, up to 3 per subject', () => {
    for (const g of [5, 6, 7, 8, 9, 10] as const) {
      const items = buildSkillsCheck(g, 3, rng(g))
      expect(items.length).toBeGreaterThan(0)
      const bySubject = new Map<string, number>()
      for (const it of items) {
        bySubject.set(it.subjectId, (bySubject.get(it.subjectId) ?? 0) + 1)
        expect(it.q.answer).toBeGreaterThanOrEqual(0)
        expect(it.q.answer).toBeLessThan(it.q.options.length)
      }
      for (const n of bySubject.values()) expect(n).toBeLessThanOrEqual(3)
    }
    const g8 = buildSkillsCheck(8, 3, rng(1))
    const topics = new Map(getAllTopics().map((t) => [t.key, t]))
    for (const it of g8) expect(topicGrade(topics.get(it.topicKey)!)).toBeLessThan(8)
  })

  it('scores answers and lists wrong topics as warm-ups', () => {
    const items = buildSkillsCheck(8, 3, rng(2))
    const answers = items.map((it, i) => (i === 0 ? (it.q.answer + 1) % it.q.options.length : it.q.answer))
    const res = scoreSkillsCheck(items, answers)
    expect(res.warmups).toEqual([items[0].topicKey])
    const total = Object.values(res.results).reduce((s, r) => s + r.total, 0)
    expect(total).toBe(items.length)
    // skipping the rest only counts answered questions
    expect(Object.values(scoreSkillsCheck(items, answers.slice(0, 2)).results).reduce((s, r) => s + r.total, 0)).toBe(2)
  })

  it('recommends warm-ups first, then own-grade topics', () => {
    const items = buildSkillsCheck(8, 3, rng(3))
    const check = scoreSkillsCheck(items, items.map(() => null))
    expect(nextForLearner({}, 8, check)).toMatchObject({ warmup: true, topic: { key: check.warmups[0] } })
    const next = nextForLearner({}, 8, null)
    expect(next.warmup).toBe(false)
    expect(topicGrade(next.topic!)).toBe(8)
  })

  it('falls back to the nearest grade with content', () => {
    expect(gradeTopics('physics', 9).length).toBeGreaterThan(0)
    expect(effectiveGrade(10, 'mathematics')).toBe(10)
    expect(effectiveGrade(5, 'mathematics')).toBeGreaterThan(5)
  })
})

describe('skills check questions', () => {
  it('never uses questions that refer to a lab or the lesson', () => {
    for (let seed = 1; seed < 30; seed++) {
      for (const it of buildSkillsCheck(8, 3, rng(seed))) expect(it.q.prompt).not.toMatch(/\b(lab|lesson|Thali Builder)\b/i)
    }
  })
})
