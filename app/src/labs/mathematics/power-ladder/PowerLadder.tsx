import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { show } from '../_shared/fraction'
import { sup } from '../_shared/number'
import { ladder } from './model'

const BASES = [2, 3, 5, 10]
const exp = (k: number) => (k < 0 ? `⁻${sup(-k)}` : sup(k))

export default function PowerLadder() {
  const [base, setBase] = useState(2)
  const rows = ladder(base, 4, -4)
  const [shown, setShown] = useState(4)
  return (
    <LabFrame labId="power-ladder" title="Power Ladder" subtitle="Climb down the ladder of powers, past zero and into negative exponents." howTo={<p>Each step down divides by the base. Predict the next value, then reveal it. What must 2⁰ and 2⁻¹ be to keep the pattern going?</p>}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        Base:
        {BASES.map((b) => (
          <button key={b} type="button" aria-pressed={base === b} onClick={() => { setBase(b); setShown(4) }} className={cn('rounded-lg border-2 px-3 py-1 font-mono font-semibold', base === b ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{b}</button>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border bg-background">
        {rows.map((r, i) => (
          <div key={r.k} className={cn('grid grid-cols-[5rem_1fr_7rem] items-center border-b px-4 py-1.5 font-mono text-lg last:border-0', r.k === 0 && i < shown && 'bg-success-soft', r.k < 0 && i < shown && 'bg-chem-soft', i >= shown && 'opacity-30')}>
            <span className="font-bold">{base}{exp(r.k)}</span>
            <span>= {i < shown ? show(r.v) : '?'}{i < shown && r.k < 0 && <span className="text-sm text-muted-foreground"> = 1/{base}{sup(-r.k)}</span>}</span>
            <span className="text-right text-xs text-muted-foreground">{i > 0 && i < shown ? `÷ ${base} ↓` : ''}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Button onClick={() => setShown((s) => Math.min(rows.length, s + 1))} disabled={shown >= rows.length}>Next step ↓ (÷ {base})</Button>
        <Button variant="outline" onClick={() => setShown(4)}>Reset</Button>
      </div>
      {shown > 4 && (
        <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
          Dividing {base}¹ by {base} gives <b>{base}⁰ = 1</b>. Any non-zero number to the power 0 is 1.
          {shown > 5 && <> Keep going and you get fractions: <b>{base}⁻ⁿ = 1/{base}ⁿ</b>. A negative exponent means “one over”, not “negative”.</>}
        </p>
      )}
    </LabFrame>
  )
}
