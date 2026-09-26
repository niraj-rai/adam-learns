import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { evaluate, format } from '../_shared/poly'
import { trace, TRICKS } from './model'

/** x as bags 🎒 and the number as coins 🪙 */
function Bags({ p }: { p: number[] }) {
  const bags = p[1] ?? 0
  const coins = p[0] ?? 0
  return (
    <span className="inline-flex flex-wrap items-center gap-0.5 text-lg" aria-label={format(p, 'x')}>
      {bags > 12 ? <span className="text-sm">{bags} × 🎒</span> : '🎒'.repeat(Math.max(0, Math.round(bags))) + (bags % 1 ? ' ½🎒' : '')}
      {coins !== 0 && <span className="ml-1 text-sm">{coins > 0 ? (bags ? '+ ' : '') : '− '}{Math.abs(coins) > 12 ? `${Math.abs(coins)} × 🪙` : '🪙'.repeat(Math.abs(coins))}</span>}
    </span>
  )
}

export default function NumberTrick() {
  const [ti, setTi] = useState(0)
  const t = TRICKS[ti]
  const [secret, setSecret] = useState(7)
  const [step, setStep] = useState(0)
  const [algebra, setAlgebra] = useState(false)
  const tr = trace(t)
  const done = step >= t.steps.length - 1
  return (
    <LabFrame labId="number-trick" title="Algebra Magic Tricks" subtitle="Think of a number… Algebra shows why the trick always works." howTo={<p>Choose a trick and a secret number, then follow the steps. Afterwards, switch on the algebra view: a bag 🎒 stands for your secret number and coins 🪙 are ordinary numbers.</p>}>
      <div className="flex flex-wrap gap-1">
        {TRICKS.map((x, i) => (
          <button key={x.id} type="button" aria-pressed={ti === i} onClick={() => { setTi(i); setStep(0); setAlgebra(false) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ti === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>🎩 {x.name}</button>
        ))}
      </div>
      <label className="mt-3 block text-sm">Your secret number: <b>{secret}</b>
        <Slider value={[secret]} min={1} max={ti === 2 ? 99 : 50} step={1} onValueChange={([v]) => { setSecret(v); setStep(0) }} className="mt-1.5" aria-label="Secret number" />
      </label>
      <ol className="mt-3 space-y-1.5">
        {t.steps.slice(0, step + 1).map((s, i) => (
          <li key={i} className="grid items-center gap-2 rounded-xl border bg-background px-3 py-2 sm:grid-cols-[1fr_6rem_12rem]">
            <span className="text-sm">{i + 1}. {s.say}</span>
            <span className="font-mono text-lg font-bold">{evaluate(tr[i], secret)}</span>
            {algebra ? <span className="flex items-center gap-2"><span className="font-mono text-sm">{format(tr[i])}</span><Bags p={tr[i]} /></span> : <span />}
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => setStep((s) => s + 1)} disabled={done}>Next step</Button>
        <Button variant="outline" onClick={() => setAlgebra((v) => !v)}>{algebra ? 'Hide' : 'Show'} the algebra</Button>
        <Button variant="ghost" onClick={() => setStep(0)}>Start again</Button>
      </div>
      {done && (
        <p className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">
          {t.id === 'five' && <>🎩 Your answer is <b>5</b>, whatever number you chose! The algebra shows why: x → 2x → 2x + 10 → x + 5 → <b>5</b>. The secret number cancels out.</>}
          {t.id === 'back' && <>🎩 You're back to <b>{secret}</b>! x → 3x → 3x + 6 → x + 2 → <b>x</b>. Each step is undone by a later one.</>}
          {t.id === 'birthday' && <>🎩 The answer is <b>{secret * 100}</b>: your age followed by two zeros! x → 2x → 2x + 5 → 100x + 250 → <b>100x</b>.</>}
          {' '}Now invent your own trick, and use algebra to prove it works.
        </p>
      )}
    </LabFrame>
  )
}
