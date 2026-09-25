import { describe, expect, it } from 'vitest'
import { getLab, LABS } from '@/labs/registry'
import { getAllTopics, getPractice, getSubjects, getTopicByKey } from './loader'

// Loading the module already validates every JSON file against the Zod schemas;
// these tests add cross-file consistency checks that a schema can't express.

describe('content', () => {
  it('loads at least one subject with units and topics', () => {
    const subjects = getSubjects()
    expect(subjects.length).toBeGreaterThan(0)
    for (const s of subjects) {
      expect(s.units.length).toBeGreaterThan(0)
      for (const u of s.units) expect(u.topics.length).toBeGreaterThan(0)
    }
  })

  it('every topic has a lesson and a practice set', () => {
    for (const t of getAllTopics()) {
      expect(t.loadLesson, `${t.key} lesson.mdx`).toBeTypeOf('function')
      expect(getPractice(t.key), `${t.key} practice.json`).toBeDefined()
    }
  })

  it('every lab referenced by a topic exists, and lab → topic links are valid', () => {
    for (const t of getAllTopics()) {
      for (const id of t.labs) expect(getLab(id), `${t.key} → lab ${id}`).toBeDefined()
    }
    for (const lab of LABS) {
      for (const key of lab.topics) expect(getTopicByKey(key), `lab ${lab.id} → ${key}`).toBeDefined()
    }
  })

  it('every question is internally consistent', () => {
    for (const t of getAllTopics()) {
      const set = getPractice(t.key)!
      expect(set.questions.length, `${t.key} should have ≥ 8 questions`).toBeGreaterThanOrEqual(8)
      for (const q of set.questions) {
        const where = `${t.key}#${q.id}`
        switch (q.type) {
          case 'mcq':
            expect(q.answer, where).toBeLessThan(q.options.length)
            expect(new Set(q.options).size, `${where} duplicate options`).toBe(q.options.length)
            break
          case 'multi-select':
            for (const a of q.answer) expect(a, where).toBeLessThan(q.options.length)
            break
          case 'sort-bins':
            for (const it of q.items) expect(it.bin, where).toBeLessThan(q.bins.length)
            expect(new Set(q.items.map((i) => i.label)).size, `${where} duplicate items`).toBe(q.items.length)
            break
          case 'match-pairs':
            expect(new Set(q.pairs.map((p) => p.right)).size, `${where} duplicate right side`).toBe(q.pairs.length)
            break
          case 'order-steps':
            expect(new Set(q.steps).size, `${where} duplicate steps`).toBe(q.steps.length)
            break
          case 'fill-blank':
            expect(q.text.split('___').length - 1, `${where} blank count`).toBe(q.blanks.length)
            if (q.wordBank) for (const b of q.blanks) expect(q.wordBank.includes(b[0]), `${where} word bank missing "${b[0]}"`).toBe(true)
            break
        }
      }
    }
  })

  it('every topic has at least one IB-criterion question for each criterion it lists', () => {
    for (const t of getAllTopics()) {
      const criteria = new Set(getPractice(t.key)!.questions.map((q) => q.ibCriterion))
      for (const c of t.ibCriteria.filter((c) => c !== 'D' && c !== 'B')) expect(criteria.has(c), `${t.key} criterion ${c}`).toBe(true)
    }
  })
})
