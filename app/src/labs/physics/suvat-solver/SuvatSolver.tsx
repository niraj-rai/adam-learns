import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { solveSuvat, type Knowns } from '../_shared/kinematics'

type K = 'u' | 'v' | 'a' | 't' | 's'
const NAMES: Record<K, string> = { u: 'initial velocity u (m/s)', v: 'final velocity v (m/s)', a: 'acceleration a (m/s²)', t: 'time t (s)', s: 'displacement s (m)' }
const SCENARIOS: { name: string; emoji: string; story: string; known: Knowns; ask: K[] }[] = [
  { name: 'Metro braking', emoji: '🚇', story: 'A Namma Metro train moving at 20 m/s brakes at 1.25 m/s² to stop at a station.', known: { u: 20, v: 0, a: -1.25 }, ask: ['t', 's'] },
  { name: 'Coconut falls', emoji: '🥥', story: 'A coconut falls from rest from a 20 m tree (take g = 9.8 m/s², ignore air).', known: { u: 0, a: 9.8, s: 20 }, ask: ['v', 't'] },
  { name: 'Cricket ball up', emoji: '🏏', story: 'A ball is thrown straight up at 14 m/s. At the top it is momentarily at rest (a = −9.8 m/s²).', known: { u: 14, v: 0, a: -9.8 }, ask: ['t', 's'] },
  { name: 'Car speeds up', emoji: '🚗', story: 'A car starts from rest and covers 100 m in 10 s with constant acceleration.', known: { u: 0, t: 10, s: 100 }, ask: ['a', 'v'] },
  { name: 'Scooter overtakes', emoji: '🛵', story: 'A scooter at 10 m/s accelerates at 2 m/s² for 5 s.', known: { u: 10, a: 2, t: 5 }, ask: ['v', 's'] },
]

export default function SuvatSolver() {
  const [mode, setMode] = useState<'story' | 'free'>('story')
  const [si, setSi] = useState(0)
  const [free, setFree] = useState<Record<K, string>>({ u: '0', v: '', a: '2', t: '5', s: '' })
  const sc = SCENARIOS[si]
  const freeKnown: Knowns = Object.fromEntries(Object.entries(free).filter(([, v]) => v.trim() !== '' && !Number.isNaN(Number(v.replace('−', '-')))).map(([k, v]) => [k, Number(v.replace('−', '-'))]))
  const known = mode === 'story' ? sc.known : freeKnown
  const nKnown = Object.keys(known).length
  const res = nKnown === 3 ? solveSuvat(known) : null
  const f = (x: number) => (Math.round(x * 100) / 100).toString().replace('-', '−')
  return (
    <LabFrame labId="suvat-solver" title="Equations of Motion" subtitle="Know any three of u, v, a, t and s? The equations of motion find the other two." howTo={<p>Story mode: solve real problems. Free mode: fill in any three boxes and leave two empty.</p>}>
      <div className="mb-3 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['story', '📖 Stories'], ['free', '🧮 Free solve']] as const).map(([k, lbl]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn('rounded-md px-3 py-1', mode === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>)}
      </div>
      {mode === 'story' ? (
        <>
          <div className="flex flex-wrap gap-1">
            {SCENARIOS.map((x, i) => <button key={x.name} type="button" aria-pressed={si === i} onClick={() => setSi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', si === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
          </div>
          <p className="mt-3 rounded-2xl bg-muted/50 p-4 text-[15px]">{sc.story}</p>
        </>
      ) : (
        <div className="grid gap-2 sm:grid-cols-5">
          {(Object.keys(NAMES) as K[]).map((k) => (
            <label key={k} className="text-xs">{NAMES[k]}
              <input value={free[k]} onChange={(e) => setFree((x) => ({ ...x, [k]: e.target.value }))} placeholder="?" aria-label={NAMES[k]} className="mt-1 block w-full rounded-lg border-2 bg-background px-2 py-1 font-mono" />
            </label>
          ))}
        </div>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {(Object.keys(NAMES) as K[]).map((k) => (
          <Readout key={k} label={`${k}${k in known ? ' (given)' : ''}`} value={k in known ? f(known[k]!) : res ? f(res[k]) : '?'} />
        ))}
      </div>
      <p className={cn('mt-3 rounded-xl px-4 py-2 text-sm', mode === 'free' && nKnown !== 3 ? 'bg-warn-soft' : 'bg-chem-soft')}>
        {mode === 'free' && nKnown !== 3
          ? `Fill in exactly three values (you have ${nKnown}).`
          : !res
            ? 'No real answer: this combination is impossible (for example, speeding up can never bring you to a stop).'
            : <>Equations used: <b>v = u + at</b>, <b>s = ut + ½at²</b>, <b>v² = u² + 2as</b> (and s = ½(u + v)t). Choose the one that contains your three knowns and the unknown you want.</>}
      </p>
    </LabFrame>
  )
}
