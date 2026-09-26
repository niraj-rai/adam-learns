import { frac, mul, add, type Frac } from '../_shared/fraction'

export type Branch = { label: string; p: Frac }
export type Experiment = { id: string; name: string; emoji: string; first: Branch[]; second: (first: string) => Branch[]; events: { name: string; test: (a: string, b: string) => boolean }[] }

export const EXPERIMENTS: Experiment[] = [
  {
    id: 'coins', name: 'Toss two coins', emoji: '🪙',
    first: [{ label: 'H', p: frac(1, 2) }, { label: 'T', p: frac(1, 2) }],
    second: () => [{ label: 'H', p: frac(1, 2) }, { label: 'T', p: frac(1, 2) }],
    events: [{ name: 'Two heads', test: (a, b) => a === 'H' && b === 'H' }, { name: 'Exactly one head', test: (a, b) => (a === 'H') !== (b === 'H') }, { name: 'At least one head', test: (a, b) => a === 'H' || b === 'H' }],
  },
  {
    id: 'bag-replace', name: 'Bag: 3 red, 2 blue, with replacement', emoji: '🔁',
    first: [{ label: 'R', p: frac(3, 5) }, { label: 'B', p: frac(2, 5) }],
    second: () => [{ label: 'R', p: frac(3, 5) }, { label: 'B', p: frac(2, 5) }],
    events: [{ name: 'Both red', test: (a, b) => a === 'R' && b === 'R' }, { name: 'Same colour', test: (a, b) => a === b }, { name: 'At least one blue', test: (a, b) => a === 'B' || b === 'B' }],
  },
  {
    id: 'bag-no-replace', name: 'Bag: 3 red, 2 blue, without replacement', emoji: '🚫',
    first: [{ label: 'R', p: frac(3, 5) }, { label: 'B', p: frac(2, 5) }],
    second: (f) => (f === 'R' ? [{ label: 'R', p: frac(2, 4) }, { label: 'B', p: frac(2, 4) }] : [{ label: 'R', p: frac(3, 4) }, { label: 'B', p: frac(1, 4) }]),
    events: [{ name: 'Both red', test: (a, b) => a === 'R' && b === 'R' }, { name: 'Same colour', test: (a, b) => a === b }, { name: 'At least one blue', test: (a, b) => a === 'B' || b === 'B' }],
  },
]

export function outcomes(e: Experiment) {
  return e.first.flatMap((f) => e.second(f.label).map((s) => ({ a: f.label, b: s.label, p: mul(f.p, s.p) })))
}

export function eventProbability(e: Experiment, test: (a: string, b: string) => boolean): Frac {
  return outcomes(e).filter((o) => test(o.a, o.b)).reduce((sum, o) => add(sum, o.p), frac(0, 1))
}
