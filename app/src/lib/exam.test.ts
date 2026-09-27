import { describe, expect, it } from 'vitest'
import type { Question } from '@/content/schema'
import { buildPaper, criterionLevel, marksEarned, marksFor, mypGrade, scorePaper, weakTopics, itemKey, type PoolItem } from './exam'

const base = { difficulty: 1, ibCriterion: 'A', explain: '', cbseStyle: false } as const
const mcq = (id: string, crit: 'A' | 'C' | 'D' = 'A'): Question => ({ ...base, ibCriterion: crit, id, type: 'mcq', prompt: id, options: ['a', 'b'], answer: 1 }) as Question
const num = (id: string, difficulty = 1): Question => ({ ...base, difficulty, id, type: 'numeric', prompt: id, answer: 10, tolerance: 0 }) as Question
const short = (id: string): Question => ({ ...base, ibCriterion: 'C', id, type: 'short-answer', prompt: id, modelAnswer: 'x', rubric: ['one', 'two', 'three', 'four'] }) as Question
const sort = (id: string): Question => ({ ...base, id, type: 'sort-bins', prompt: id, bins: ['x', 'y'], items: [{ label: 'a', bin: 0 }, { label: 'b', bin: 1 }, { label: 'c', bin: 0 }, { label: 'd', bin: 1 }] }) as Question

const pool: PoolItem[] = []
for (const t of ['s/u/t1', 's/u/t2', 's/u/t3'])
  for (let i = 0; i < 8; i++) pool.push({ topicKey: t, q: [mcq(`m${i}`, i % 2 ? 'A' : 'D'), num(`n${i}`, i % 3), short(`s${i}`), sort(`b${i}`)][i % 4] })

describe('exam papers', () => {
  it('gives CBSE-style marks', () => {
    expect([marksFor(mcq('a')), marksFor(sort('b')), marksFor(num('c', 1)), marksFor(num('d', 2)), marksFor(short('e'))]).toEqual([1, 2, 2, 3, 4])
  })

  it('builds the same paper from the same seed, with no repeated questions', () => {
    const a = buildPaper(pool, 'cbse', 'standard', 0.42)
    const b = buildPaper(pool, 'cbse', 'standard', 0.42)
    expect(a).toEqual(b)
    const keys = a.sections.flatMap((s) => s.items.map(itemKey))
    expect(new Set(keys).size).toBe(keys.length)
    expect(a.sections.map((s) => s.id)).toEqual(['A', 'B', 'C', 'D'])
    expect(a.sections[0].items.every((i) => i.marks === 1)).toBe(true)
    expect(a.minutes).toBe(45)
    expect(a.totalMarks).toBe(a.sections.flatMap((s) => s.items).reduce((x, i) => x + i.marks, 0))
  })

  it('spreads questions across topics', () => {
    const a = buildPaper(pool, 'cbse', 'short', 0.1)
    expect(new Set(a.sections[0].items.map((i) => i.topicKey)).size).toBe(3)
  })

  it('groups IB papers by criterion', () => {
    const p = buildPaper(pool, 'ib', 'short', 0.3)
    expect(p.sections.map((s) => s.id).sort()).toEqual(['A', 'C', 'D'])
  })

  it('marks answers, with part marks and self-marked written answers', () => {
    expect(marksEarned(mcq('a'), { type: 'mcq', choice: 1 }, 1)).toBe(1)
    expect(marksEarned(mcq('a'), { type: 'mcq', choice: 0 }, 1)).toBe(0)
    expect(marksEarned(sort('b'), { type: 'sort-bins', placement: { 0: 0, 1: 1, 2: 1, 3: 0 } }, 2)).toBe(1)
    expect(marksEarned(short('s'), { type: 'short-answer', text: 'my answer', checks: [true, true, true, false], revealed: true }, 4)).toBe(3)
    expect(marksEarned(num('n'), undefined, 2)).toBe(0)
  })

  it('scores a paper by section, topic and criterion, and finds weak topics', () => {
    const paper = buildPaper(pool, 'cbse', 'short', 0.5)
    const find = (t: string, id: string) => pool.find((p) => p.topicKey === t && p.q.id === id)?.q
    const r = scorePaper(paper, find, {})
    expect(r.earned).toBe(0)
    expect(r.total).toBe(paper.totalMarks)
    expect(weakTopics(r).length).toBeGreaterThan(0)
    // a question removed since the paper was set is left out, not counted as wrong
    const r2 = scorePaper(paper, (t, id) => (id === paper.sections[0].items[0].questionId && t === paper.sections[0].items[0].topicKey ? undefined : find(t, id)), {})
    expect(r2.total).toBe(paper.totalMarks - 1)
  })

  it('converts marks to IB levels and an approximate MYP grade', () => {
    expect(criterionLevel({ earned: 6, total: 8 })).toBe(6)
    expect(mypGrade([8, 8, 8, 8])).toBe(7)
    expect(mypGrade([4, 4, 4, 4])).toBe(4)
    expect(mypGrade([0, 1, 0])).toBe(1)
    expect(mypGrade([6, 6, 6])).toBe(6)
    expect(mypGrade([5, 5, 5, 4])).toBe(5)
  })
})
