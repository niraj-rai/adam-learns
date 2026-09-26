import type { Question } from '@/content/schema'

export type Response =
  | { type: 'mcq'; choice: number | null }
  | { type: 'multi-select'; choices: number[] }
  | { type: 'sort-bins'; placement: Record<number, number> }
  | { type: 'match-pairs'; matches: Record<number, string> }
  | { type: 'order-steps'; order: string[] }
  | { type: 'fill-blank'; values: string[] }
  | { type: 'numeric'; value: string }
  | { type: 'short-answer'; text: string; checks: boolean[]; revealed: boolean }

export type Grade = {
  correct: boolean
  /** indices of parts that are wrong (bins items, blanks, steps, pairs), for highlighting */
  wrongParts: number[]
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[−–]/g, '-')
    .replace(/[^\p{L}\p{N}.\-°/ ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').replace(/[−–]/g, '-').replace(/[^\d.\-eE]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function isComplete(q: Question, r: Response): boolean {
  switch (r.type) {
    case 'mcq':
      return r.choice !== null
    case 'multi-select':
      return r.choices.length > 0
    case 'sort-bins':
      return q.type === 'sort-bins' && Object.keys(r.placement).length === q.items.length
    case 'match-pairs':
      return q.type === 'match-pairs' && Object.keys(r.matches).length === q.pairs.length
    case 'order-steps':
      return true
    case 'fill-blank':
      return r.values.every((v) => v.trim() !== '')
    case 'numeric':
      return parseNumber(r.value) !== null
    case 'short-answer':
      return r.revealed && r.text.trim().length >= 10
  }
}

export function grade(q: Question, r: Response): Grade {
  switch (q.type) {
    case 'mcq': {
      const choice = r.type === 'mcq' ? r.choice : null
      return { correct: choice === q.answer, wrongParts: [] }
    }
    case 'multi-select': {
      const got = new Set(r.type === 'multi-select' ? r.choices : [])
      const want = new Set(q.answer)
      const wrongParts = q.options.map((_, i) => i).filter((i) => got.has(i) !== want.has(i))
      return { correct: wrongParts.length === 0, wrongParts }
    }
    case 'sort-bins': {
      const placement = r.type === 'sort-bins' ? r.placement : {}
      const wrongParts = q.items.map((it, i) => (placement[i] === it.bin ? -1 : i)).filter((i) => i >= 0)
      return { correct: wrongParts.length === 0, wrongParts }
    }
    case 'match-pairs': {
      const matches = r.type === 'match-pairs' ? r.matches : {}
      const wrongParts = q.pairs.map((p, i) => (matches[i] === p.right ? -1 : i)).filter((i) => i >= 0)
      return { correct: wrongParts.length === 0, wrongParts }
    }
    case 'order-steps': {
      const order = r.type === 'order-steps' ? r.order : []
      const wrongParts = q.steps.map((s, i) => (order[i] === s ? -1 : i)).filter((i) => i >= 0)
      return { correct: wrongParts.length === 0, wrongParts }
    }
    case 'fill-blank': {
      const values = r.type === 'fill-blank' ? r.values : []
      const wrongParts = q.blanks
        .map((accepted, i) => (accepted.some((a) => norm(a) === norm(values[i] ?? '')) ? -1 : i))
        .filter((i) => i >= 0)
      return { correct: wrongParts.length === 0, wrongParts }
    }
    case 'numeric': {
      const n = parseNumber(r.type === 'numeric' ? r.value : '')
      return { correct: n !== null && Math.abs(n - q.answer) <= q.tolerance + 1e-9, wrongParts: [] }
    }
    case 'short-answer': {
      // self-assessed against the rubric: at least half the rubric points met
      const checks = r.type === 'short-answer' ? r.checks : []
      const met = checks.filter(Boolean).length
      return { correct: met >= Math.ceil(q.rubric.length / 2), wrongParts: [] }
    }
  }
}

export function emptyResponse(q: Question, shuffledSteps?: string[]): Response {
  switch (q.type) {
    case 'mcq':
      return { type: 'mcq', choice: null }
    case 'multi-select':
      return { type: 'multi-select', choices: [] }
    case 'sort-bins':
      return { type: 'sort-bins', placement: {} }
    case 'match-pairs':
      return { type: 'match-pairs', matches: {} }
    case 'order-steps':
      return { type: 'order-steps', order: shuffledSteps ?? [...q.steps] }
    case 'fill-blank':
      return { type: 'fill-blank', values: q.blanks.map(() => '') }
    case 'numeric':
      return { type: 'numeric', value: '' }
    case 'short-answer':
      return { type: 'short-answer', text: '', checks: q.rubric.map(() => false), revealed: false }
  }
}

export function shuffle<T>(arr: T[], seed = Math.random()): T[] {
  const a = [...arr]
  let s = Math.floor(seed * 2 ** 31) || 1
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Shuffle but never return the original order (for order-steps). */
export function shuffleNotIdentity<T>(arr: T[]): T[] {
  if (arr.length < 2) return [...arr]
  for (let i = 0; i < 10; i++) {
    const s = shuffle(arr)
    if (s.some((x, k) => x !== arr[k])) return s
  }
  return [...arr.slice(1), arr[0]]
}
