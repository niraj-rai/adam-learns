import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ladder, QUICK, result, sign } from './model'

const m = (n: number) => (n < 0 ? `−${-n}` : `${n}`)
const p = (n: number) => (n < 0 ? `(−${-n})` : `${n}`)

export default function SignPatterns() {
  const [tab, setTab] = useState<'ladder' | 'grid' | 'quick'>('ladder')
  return (
    <LabFrame labId="sign-patterns" title="Sign Patterns" subtitle="Why is negative × negative positive? Let the pattern decide." howTo={<p>Ladder: pick a number and continue the pattern one row at a time. Grid: see the signs of every product from −5 to 5. Quick check: predict the sign, then see the answer.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['ladder', '🪜 Pattern ladder'], ['grid', '🟩 Sign grid'], ['quick', '⚡ Quick check']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'ladder' ? <Ladder /> : tab === 'grid' ? <Grid /> : <Quick />}
    </LabFrame>
  )
}

function Ladder() {
  const [a, setA] = useState(-3)
  const [shown, setShown] = useState(4)
  const rows = ladder(a)
  const step = -a
  return (
    <div className="space-y-3">
      <label className="block text-sm">First number: <b>{m(a)}</b>
        <Slider value={[a]} min={-5} max={5} step={1} onValueChange={([v]) => { setA(v); setShown(4) }} className="mt-1.5" aria-label="First number" />
      </label>
      <div className="overflow-hidden rounded-2xl border bg-background">
        {rows.map((r, i) => (
          <div key={r.b} className={cn('flex items-center gap-3 border-b px-4 py-1.5 font-mono text-lg last:border-0', i >= shown && 'opacity-30', r.b < 0 && i < shown && 'bg-chem-soft')}>
            <span className="w-40">{p(r.a)} × {p(r.b)} =</span>
            <span className={cn('w-12 text-right font-bold', r.p > 0 ? 'text-success' : r.p < 0 ? 'text-destructive' : '')}>{i < shown ? m(r.p) : '?'}</span>
            {i > 0 && i < shown && <span className="text-sm text-muted-foreground">{step === 0 ? 'stays 0' : `${step > 0 ? '+' : '−'}${Math.abs(step)} from the row above`}</span>}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setShown((s) => Math.min(rows.length, s + 1))} disabled={shown >= rows.length}>Continue the pattern ↓</Button>
        <Button variant="outline" onClick={() => setShown(4)}>Reset</Button>
      </div>
      {a < 0 && shown === rows.length && (
        <p className="rounded-xl bg-success-soft px-4 py-2 text-sm">Each time the second number goes down by 1, the answer goes <b>up by {-a}</b>. To keep the pattern going past zero, <b>{p(a)} × (−1) must be {-a}</b>. So negative × negative is positive: that's not a trick, it's the only answer that keeps maths consistent.</p>
      )}
    </div>
  )
}

function Grid() {
  const [hover, setHover] = useState<[number, number] | null>(null)
  const vals = [5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5]
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <div className="overflow-x-auto">
        <table className="mx-auto border-collapse text-center text-xs" onMouseLeave={() => setHover(null)}>
          <thead><tr><th className="p-1">×</th>{[...vals].reverse().map((b) => <th key={b} className="w-8 p-1">{m(b)}</th>)}</tr></thead>
          <tbody>
            {vals.map((a) => (
              <tr key={a}>
                <th className="p-1">{m(a)}</th>
                {[...vals].reverse().map((b) => {
                  const v = a * b + 0
                  return (
                    <td key={b} onMouseEnter={() => setHover([a, b])} onClick={() => setHover([a, b])} className={cn('h-8 w-8 cursor-pointer border border-background font-semibold', v > 0 ? 'bg-emerald-400/70' : v < 0 ? 'bg-orange-400/70' : 'bg-muted', hover && hover[0] === a && hover[1] === b && 'ring-2 ring-primary')}>{v === 0 ? '0' : v > 0 ? '+' : '−'}</td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2">
        <Readout label="Product" value={hover ? `${p(hover[0])} × ${p(hover[1])} = ${m(hover[0] * hover[1] + 0)}` : 'Hover or tap a square'} />
        <p className="rounded-xl bg-chem-soft p-3 text-sm">🟩 same signs → <b>positive</b><br />🟧 different signs → <b>negative</b><br />The same rule works for division: (−48) ÷ (−6) = 8.</p>
      </div>
    </div>
  )
}

function Quick() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const [right, setRight] = useState(0)
  const q = QUICK[i]
  const ans = result(q)
  const done = i >= QUICK.length
  if (done)
    return (
      <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
        <p className="text-4xl">⚡</p>
        <p className="mt-2 font-heading text-xl font-semibold">{right} / {QUICK.length} signs right first time</p>
        <Button className="mt-3" variant="outline" onClick={() => { setI(0); setPick(null); setRight(0) }}>Try again</Button>
      </div>
    )
  const choose = (s: string) => {
    if (pick) return
    setPick(s)
    if (s === sign(ans)) { setRight((r) => r + 1); sfx.correct() } else sfx.wrong()
  }
  return (
    <div className="space-y-3">
      <p className="text-center font-mono text-3xl">{p(q.a)} {q.op} {p(q.b)} = ?</p>
      <p className="text-center text-sm text-muted-foreground">Is the answer positive, negative or zero?</p>
      <div className="flex justify-center gap-2">
        {['+', '−', '0'].map((s) => (
          <button key={s} type="button" disabled={Boolean(pick)} onClick={() => choose(s)} className={cn('h-14 w-20 rounded-xl border-2 text-2xl font-bold', pick && s === sign(ans) && 'border-success bg-success-soft', pick === s && s !== sign(ans) && 'border-destructive/60 bg-destructive/10')}>{s}</button>
        ))}
      </div>
      {pick && (
        <div role="status" className="text-center">
          <p className="font-mono text-xl">{p(q.a)} {q.op} {p(q.b)} = <b>{m(ans)}</b></p>
          <Button className="mt-2" autoFocus onClick={() => { setI(i + 1); setPick(null) }}>{i + 1 < QUICK.length ? 'Next →' : 'Finish'}</Button>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">{i + 1} / {QUICK.length}</p>
    </div>
  )
}
