import { useParams } from '@tanstack/react-router'

export type Criterion = 'A' | 'B' | 'C' | 'D'

/** IB MYP criteria differ between Sciences and Mathematics. */
const SCIENCE = {
  A: ['Knowing', 'Knowing & understanding'],
  B: ['Inquiring', 'Inquiring & designing'],
  C: ['Processing', 'Processing & evaluating'],
  D: ['Reflecting', 'Reflecting on the impacts of science'],
} as const
const MATHS = {
  A: ['Knowing', 'Knowing & understanding'],
  B: ['Patterns', 'Investigating patterns'],
  C: ['Communicating', 'Communicating'],
  D: ['Applying', 'Applying mathematics in real-life contexts'],
} as const

export function criterionName(c: Criterion, subject?: string, long = false) {
  const set = subject === 'mathematics' ? MATHS : SCIENCE
  return set[c][long ? 1 : 0]
}

/** Subject from the current route, when there is one. */
export function useRouteSubject(): string | undefined {
  return (useParams({ strict: false }) as { subject?: string }).subject
}
