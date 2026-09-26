import { describe, expect, it } from 'vitest'
import type { Question } from '@/content/schema'
import { grade, isComplete, parseNumber } from './grading'

const base = { id: 'x', difficulty: 1, ibCriterion: 'A' as const, cbseStyle: false, prompt: 'p', explain: 'e' }

describe('grading', () => {
  it('mcq', () => {
    const q: Question = { ...base, type: 'mcq', options: ['a', 'b'], answer: 1 }
    expect(grade(q, { type: 'mcq', choice: 1 }).correct).toBe(true)
    expect(grade(q, { type: 'mcq', choice: 0 }).correct).toBe(false)
  })

  it('multi-select needs the exact set', () => {
    const q: Question = { ...base, type: 'multi-select', options: ['a', 'b', 'c'], answer: [0, 2] }
    expect(grade(q, { type: 'multi-select', choices: [2, 0] }).correct).toBe(true)
    expect(grade(q, { type: 'multi-select', choices: [0] }).wrongParts).toEqual([2])
    expect(grade(q, { type: 'multi-select', choices: [0, 1, 2] }).wrongParts).toEqual([1])
  })

  it('sort-bins reports wrong items', () => {
    const q: Question = { ...base, type: 'sort-bins', bins: ['A', 'B'], items: [{ label: 'x', bin: 0 }, { label: 'y', bin: 1 }] }
    expect(grade(q, { type: 'sort-bins', placement: { 0: 0, 1: 1 } }).correct).toBe(true)
    expect(grade(q, { type: 'sort-bins', placement: { 0: 1, 1: 1 } }).wrongParts).toEqual([0])
  })

  it('fill-blank is case and space insensitive and accepts alternatives', () => {
    const q: Question = { ...base, type: 'fill-blank', text: '___ and ___', blanks: [['mass'], ['space', 'volume']] }
    expect(grade(q, { type: 'fill-blank', values: ['  Mass ', 'VOLUME'] }).correct).toBe(true)
    expect(grade(q, { type: 'fill-blank', values: ['mass', 'colour'] }).wrongParts).toEqual([1])
  })

  it('numeric with tolerance and messy input', () => {
    const q: Question = { ...base, type: 'numeric', answer: 2.5, tolerance: 0.01 }
    expect(grade(q, { type: 'numeric', value: '2.5 g/cm³' }).correct).toBe(true)
    expect(grade(q, { type: 'numeric', value: '2.505' }).correct).toBe(true)
    expect(grade(q, { type: 'numeric', value: '2.6' }).correct).toBe(false)
    expect(parseNumber('1,000')).toBe(1000)
    expect(parseNumber('')).toBeNull()
    expect(parseNumber('−13')).toBe(-13)
  })

  it('fill-blank accepts fractions and a typographic minus', () => {
    const q: Question = { ...base, type: 'fill-blank', text: '___ and ___', blanks: [['5/8'], ['-2']] }
    expect(grade(q, { type: 'fill-blank', values: ['5/8', '−2'] }).correct).toBe(true)
    expect(grade(q, { type: 'fill-blank', values: ['58', '2'] }).correct).toBe(false)
  })

  it('order-steps', () => {
    const q: Question = { ...base, type: 'order-steps', steps: ['a', 'b', 'c'] }
    expect(grade(q, { type: 'order-steps', order: ['a', 'b', 'c'] }).correct).toBe(true)
    expect(grade(q, { type: 'order-steps', order: ['b', 'a', 'c'] }).wrongParts).toEqual([0, 1])
  })

  it('short-answer passes when at least half the rubric is ticked', () => {
    const q: Question = { ...base, type: 'short-answer', modelAnswer: 'm', rubric: ['1', '2', '3'] }
    expect(grade(q, { type: 'short-answer', text: 'x', checks: [true, true, false], revealed: true }).correct).toBe(true)
    expect(grade(q, { type: 'short-answer', text: 'x', checks: [true, false, false], revealed: true }).correct).toBe(false)
    expect(isComplete(q, { type: 'short-answer', text: 'long enough text', checks: [false, false, false], revealed: false })).toBe(false)
  })
})
