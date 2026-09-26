import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { gcd } from '../_shared/fraction'
import { primeFactors } from '../_shared/number'
import { decimalString, longDivision, recurringToFraction, terminates } from '../_shared/real'

const Num = ({ label, value, set, min = 1, max = 99 }: { label: string; value: number; set: (n: number) => void; min?: number; max?: number }) => (
  <label className="text-sm font-semibold">{label}
    <input type="number" value={value} min={min} max={max} onChange={(e) => set(Math.max(min, Math.min(max, Math.round(Number(e.target.value) || min))))} className="mt-1 block w-24 rounded-lg border-2 bg-background px-2 py-1 font-mono" />
  </label>
)

export default function DecimalDetective() {
  const [mode, setMode] = useState<'toDec' | 'toFrac'>('toDec')
  const [p, setP] = useState(1)
  const [q, setQ] = useState(7)
  const [head, setHead] = useState('1')
  const [rep, setRep] = useState('6')
  const ld = longDivision(p, q, 30)
  const g = gcd(p, q)
  const dq = q / g
  const term = terminates(p, q)
  const [fn, fd] = recurringToFraction(head.replace(/\D/g, ''), rep.replace(/\D/g, ''))
  return (
    <LabFrame labId="decimal-detective" title="Decimal Detective" subtitle="Every rational number's decimal either stops or repeats forever. Long division shows you why." howTo={<p>Fraction → decimal: choose p/q and watch the remainders. When a remainder comes back, the digits repeat. Decimal → fraction: type the digits before and inside the repeating part.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['toDec', 'Fraction → decimal'], ['toFrac', 'Recurring decimal → fraction']] as const).map(([m, l]) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn('rounded-md px-3 py-1', mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      {mode === 'toDec' ? (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <Num label="p (numerator)" value={p} set={setP} max={999} />
            <Num label="q (denominator)" value={q} set={setQ} min={2} max={99} />
            <span className="font-heading text-2xl">= {decimalString(p, q).replace(/\((\d+)\)/, (_, r) => `${r}${r}…`)}</span>
          </div>
          <div className="mt-3 overflow-x-auto rounded-2xl border p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Remainders at each step</p>
            <div className="mt-2 flex flex-wrap gap-1 font-mono text-sm">
              {ld.remainders.map((r, i) => <span key={i} className={cn('rounded-md border px-2 py-0.5', ld.repeatStart >= 0 && i >= ld.repeatStart ? 'border-chem bg-chem-soft' : '')} title={`digit ${ld.digits[i]}`}>{r}<sub className="text-[10px] text-muted-foreground">→{ld.digits[i]}</sub></span>)}
              {ld.repeatStart >= 0 && <span className="px-1 text-muted-foreground">→ {ld.remainders[ld.repeatStart]} again, so it repeats ↺</span>}
              {ld.repeatStart < 0 && <span className="px-1 text-muted-foreground">→ 0: it stops</span>}
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Readout label="In lowest terms" value={`${p / g}/${dq}`} />
            <Readout label="Denominator's primes" value={dq === 1 ? '—' : primeFactors(dq).join(' × ')} />
            <Readout label="Decimal type" value={term ? 'Terminating' : `Recurring (block of ${ld.digits.length - ld.repeatStart})`} />
          </div>
          <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Dividing by q, there are only q − 1 possible non-zero remainders, so either a remainder is 0 (the decimal <b>terminates</b>) or one repeats (the decimal <b>recurs</b>). In lowest terms, p/q terminates exactly when q has no prime factors except 2 and 5.</p>
        </>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-end gap-3 font-mono">
            <span className="font-heading text-2xl">0.</span>
            <label className="text-sm font-sans font-semibold">Digits before the repeat<input value={head} onChange={(e) => setHead(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 block w-24 rounded-lg border-2 bg-background px-2 py-1 font-mono" placeholder="(none)" /></label>
            <label className="text-sm font-sans font-semibold">Repeating block<input value={rep} onChange={(e) => setRep(e.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 block w-24 rounded-lg border-2 border-chem bg-background px-2 py-1 font-mono" /></label>
          </div>
          <div className="mt-3 rounded-2xl border p-3 text-sm">
            <p>Let x = 0.{head}<span className="text-chem underline decoration-dotted">{rep}{rep}{rep}</span>…</p>
            {rep ? (
              <>
                <p>Multiply by 10<sup>{head.length + rep.length}</sup>: 10<sup>{head.length + rep.length}</sup>x = {head}{rep}.{rep}{rep}…</p>
                <p>Multiply by 10<sup>{head.length}</sup>: 10<sup>{head.length}</sup>x = {head || '0'}.{rep}{rep}…</p>
                <p>Subtract, so the repeating tails cancel: {10 ** (head.length + rep.length) - 10 ** head.length}x = {Number(head + rep) - Number(head || '0')}</p>
              </>
            ) : <p>No repeating block: it's a terminating decimal, {head || '0'} ÷ 10<sup>{head.length}</sup>.</p>}
            <p className="mt-1 font-heading text-xl">x = {fn}/{fd}</p>
          </div>
          <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Every recurring decimal is a rational number. Try 0.(9): the method gives exactly <b>1</b>, because 0.999… and 1 are the same number!</p>
        </>
      )}
    </LabFrame>
  )
}
