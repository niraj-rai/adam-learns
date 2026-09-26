import type { Poly } from '../_shared/poly'

export type Step = { say: string; apply: (p: Poly) => Poly }
const lin = (p: Poly): Poly => [p[0] ?? 0, p[1] ?? 0]
export type Trick = { id: string; name: string; steps: Step[] }
export const TRICKS: Trick[] = [
  { id: 'five', name: 'Always 5', steps: [
    { say: 'Think of a number', apply: () => [0, 1] },
    { say: 'Double it', apply: (p) => lin(p).map((a) => 2 * a) },
    { say: 'Add 10', apply: (p) => [p[0] + 10, p[1]] },
    { say: 'Halve it', apply: (p) => lin(p).map((a) => a / 2) },
    { say: 'Take away the number you first thought of', apply: (p) => [p[0], p[1] - 1] },
  ] },
  { id: 'back', name: 'Back to the start', steps: [
    { say: 'Think of a number', apply: () => [0, 1] },
    { say: 'Multiply by 3', apply: (p) => lin(p).map((a) => 3 * a) },
    { say: 'Add 6', apply: (p) => [p[0] + 6, p[1]] },
    { say: 'Divide by 3', apply: (p) => lin(p).map((a) => a / 3) },
    { say: 'Subtract 2', apply: (p) => [p[0] - 2, p[1]] },
  ] },
  { id: 'birthday', name: 'Guess the age', steps: [
    { say: 'Take your age', apply: () => [0, 1] },
    { say: 'Multiply by 2', apply: (p) => lin(p).map((a) => 2 * a) },
    { say: 'Add 5', apply: (p) => [p[0] + 5, p[1]] },
    { say: 'Multiply by 50', apply: (p) => lin(p).map((a) => 50 * a) },
    { say: 'Subtract 250 (the magician reads your age from the hundreds)', apply: (p) => [p[0] - 250, p[1]] },
  ] },
]
/** Expression after each step. */
export const trace = (t: Trick) => t.steps.reduce<Poly[]>((acc, s) => [...acc, s.apply(acc.at(-1) ?? [0])], [])
