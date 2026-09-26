import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { powerForm } from '../_shared/number'
import { consecutiveWays, TESTS } from './model'

export default function NumberPlay() {
  const [tab, setTab] = useState<'tests' | 'runs'>('tests')
  return (
    <LabFrame labId="number-play" title="Number Play" subtitle="Divisibility shortcuts, and a mystery about sums of consecutive numbers." howTo={<p>Divisibility: type any whole number and see which tests it passes, and why. Consecutive sums: which numbers can be written as 3 + 4 + 5…? Find the numbers that can't.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['tests', '🔍 Divisibility'], ['runs', '➕ Consecutive sums']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'tests' ? <Tests /> : <Runs />}
    </LabFrame>
  )
}

function Tests() {
  const [raw, setRaw] = useState('918082')
  const n = Number(raw.replace(/\D/g, '').slice(0, 9)) || 0
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">Number
        <input value={raw} onChange={(e) => setRaw(e.target.value.replace(/\D/g, '').slice(0, 9))} inputMode="numeric" aria-label="Number to test" className="mt-1 block w-48 rounded-lg border-2 bg-background px-3 py-1.5 font-mono text-lg" />
      </label>
      <div className="grid gap-2 sm:grid-cols-3">
        {TESTS.map((t) => {
          const r = n > 0 ? t.check(n) : null
          return (
            <div key={t.d} className={cn('rounded-xl border-2 p-3 text-sm', r?.ok ? 'border-success/60 bg-success-soft' : 'bg-card')}>
              <p className="font-heading text-lg font-semibold">{r ? (r.ok ? '✅' : '❌') : '·'} ÷ {t.d}</p>
              <p className="text-muted-foreground">{t.rule}</p>
              {r && <p className="mt-1 font-mono">{r.why}</p>}
            </div>
          )
        })}
      </div>
      {n > 1 && <Readout label="Prime factorisation" value={n <= 1e7 ? `${n.toLocaleString('en-IN')} = ${powerForm(n)}` : 'Try a smaller number to see its primes'} />}
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Why does the digit-sum test work for 9? Because 10 = 9 + 1, 100 = 99 + 1, 1000 = 999 + 1… Each place value is a multiple of 9 plus 1, so a number leaves the same remainder when divided by 9 as its digit sum does.</p>
    </div>
  )
}

function Runs() {
  const [n, setN] = useState(15)
  const [reveal, setReveal] = useState(false)
  const ways = consecutiveWays(n)
  return (
    <div className="space-y-3">
      <label className="block text-sm">Number <b>{n}</b>
        <Slider value={[n]} min={1} max={64} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Number" />
      </label>
      <div className="rounded-2xl border bg-background p-4 font-mono">
        {ways.length ? ways.map(([a, k]) => (
          <p key={a}>{Array.from({ length: k }, (_, i) => a + i).join(' + ')} = {n}</p>
        )) : <p className="text-muted-foreground">No way to write {n} as a sum of two or more consecutive positive numbers!</p>}
      </div>
      <p className="text-sm font-semibold">Numbers 1–40 (darker = more ways):</p>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 40 }, (_, i) => {
          const k = consecutiveWays(i + 1).length
          return (
            <button key={i} type="button" onClick={() => setN(i + 1)} className={cn('rounded border py-1 text-center text-xs font-semibold', k === 0 ? 'border-destructive/50 bg-destructive/10' : k === 1 ? 'bg-sky-200/60' : k === 2 ? 'bg-sky-400/60' : 'bg-sky-600/70 text-white', n === i + 1 && 'ring-2 ring-primary')} aria-label={`${i + 1}: ${k} ways`}>{i + 1}</button>
          )
        })}
      </div>
      {!reveal ? (
        <Button variant="outline" onClick={() => setReveal(true)}>I spotted the pattern: show me</Button>
      ) : (
        <p className="rounded-xl bg-success-soft px-4 py-2 text-sm">The red numbers are <b>1, 2, 4, 8, 16, 32</b>: the <b>powers of 2</b>. A sum of consecutive numbers always has an odd factor (from its middle or its length), and powers of 2 have no odd factor bigger than 1. Every other number can be written as a consecutive sum!</p>
      )}
    </div>
  )
}
