import { describe, expect, it } from 'vitest'
import { ORGANISMS, QUESTIONS, split } from './model'

/** Can the question bank separate every organism? (Greedy search over questions.) */
function canSeparate(group: string[]): boolean {
  if (group.length <= 1) return true
  return QUESTIONS.some((q) => {
    const s = split(group, q.id)
    return s.useful && canSeparate(s.yes) && canSeparate(s.no)
  })
}

describe('dichotomous keys', () => {
  it('the question bank can separate all eight organisms', () => {
    expect(canSeparate(ORGANISMS.map((o) => o.id))).toBe(true)
  })
  it('a question that does not divide the group is not useful', () => {
    expect(split(['butterfly', 'sparrow'], 'wings').useful).toBe(false)
    expect(split(['butterfly', 'sparrow'], 'feathers').useful).toBe(true)
  })
  it('every organism has an answer to every question', () => {
    for (const o of ORGANISMS) for (const q of QUESTIONS) expect(typeof o.traits[q.id]).toBe('boolean')
  })
})
