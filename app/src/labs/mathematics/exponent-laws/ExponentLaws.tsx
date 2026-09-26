import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { sup } from '../_shared/number'
import { sci } from '../scale-of-universe/model'
import { resultExponent, type Law } from './model'

const BASES = ['2', '3', '5', '10', 'a'] as const
const big = (v: number) => (v >= 1e12 ? sci(v) : v.toLocaleString('en-IN'))
const pw = (b: string, k: number) => (k < 0 ? `1/${b}${sup(-k)}` : `${b}${sup(k)}`)

function Chip({ b, crossed }: { b: string; crossed?: boolean }) {
  return <span className={cn('grid size-9 place-items-center rounded-lg border-2 font-mono font-bold', crossed ? 'border-muted-foreground/30 text-muted-foreground line-through opacity-50' : 'border-chem bg-chem-soft')}>{b}</span>
}

export default function ExponentLaws() {
  const [law, setLaw] = useState<Law>('multiply')
  const [b, setB] = useState<(typeof BASES)[number]>('2')
  const [m, setM] = useState(3)
  const [n, setN] = useState(2)
  const r = resultExponent(law, m, n)
  const value = b === 'a' ? null : Number(b) ** r
  const lhs = law === 'multiply' ? `${pw(b, m)} × ${pw(b, n)}` : law === 'divide' ? `${pw(b, m)} ÷ ${pw(b, n)}` : `(${pw(b, m)})${sup(n)}`
  const rule = law === 'multiply' ? 'aᵐ × aⁿ = aᵐ⁺ⁿ' : law === 'divide' ? 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ' : '(aᵐ)ⁿ = aᵐˣⁿ'
  return (
    <LabFrame labId="exponent-laws" title="Exponent Laws" subtitle="Write powers out in full and the laws of exponents appear by themselves." howTo={<p>Pick a law, a base and two exponents. The chips show every factor written out. Count them to see why each law works.</p>}>
      <div className="mb-3 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['multiply', '✖️ Multiply'], ['divide', '➗ Divide'], ['power', '🔁 Power of a power']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={law === k} onClick={() => setLaw(k)} className={cn('rounded-md px-3 py-1', law === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="text-sm">Base
          <div className="mt-1 flex gap-1">
            {BASES.map((x) => <button key={x} type="button" aria-pressed={b === x} onClick={() => setB(x)} className={cn('flex-1 rounded-lg border-2 py-1 font-mono font-semibold', b === x ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{x}</button>)}
          </div>
        </div>
        <label className="text-sm">m = <b>{m}</b><Slider value={[m]} min={1} max={6} step={1} onValueChange={([v]) => setM(v)} className="mt-2" aria-label="m" /></label>
        <label className="text-sm">n = <b>{n}</b><Slider value={[n]} min={1} max={law === 'power' ? 4 : 6} step={1} onValueChange={([v]) => setN(v)} className="mt-2" aria-label="n" /></label>
      </div>
      <div className="mt-4 rounded-2xl border bg-background p-4">
        {law === 'multiply' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {Array.from({ length: m }, (_, i) => <Chip key={`m${i}`} b={b} />)}
            <span className="px-1 text-xl">×</span>
            {Array.from({ length: n }, (_, i) => <Chip key={`n${i}`} b={b} />)}
          </div>
        )}
        {law === 'divide' && (
          <div className="inline-flex flex-col items-center gap-1.5">
            <div className="flex flex-wrap gap-1.5">{Array.from({ length: m }, (_, i) => <Chip key={i} b={b} crossed={i < Math.min(m, n)} />)}</div>
            <div className="h-0.5 w-full min-w-24 bg-foreground" />
            <div className="flex flex-wrap gap-1.5">{Array.from({ length: n }, (_, i) => <Chip key={i} b={b} crossed={i < Math.min(m, n)} />)}</div>
          </div>
        )}
        {law === 'power' && (
          <div className="flex flex-wrap items-center gap-2">
            {Array.from({ length: n }, (_, g) => (
              <span key={g} className="flex gap-1 rounded-xl border-2 border-dashed p-1">{Array.from({ length: m }, (_, i) => <Chip key={i} b={b} />)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Expression" value={lhs} />
        <Readout label="Result" value={`${pw(b, r)}${value !== null ? ` = ${r < 0 ? `1/${big(Number(b) ** -r)}` : big(value)}` : ''}`} />
        <Readout label="The law" value={rule} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {law === 'multiply' && <>Joining {m} {b}s and {n} {b}s gives {m + n} {b}s in a row: <b>add the exponents</b>. (This only works when the bases are the same!)</>}
        {law === 'divide' && <>Each {b} on the bottom cancels one on the top. {m >= n ? <>{m} − {n} = {m - n} are left on top{m === n ? <>, which means <b>{b}⁰ = 1</b></> : ''}.</> : <>{n - m} {n - m > 1 ? 'are' : 'is'} left on the <b>bottom</b>: {b}{sup(m)} ÷ {b}{sup(n)} = 1/{b}{sup(n - m)} = {b}⁻{sup(n - m)}. That's where negative exponents come from!</>}</>}
        {law === 'power' && <>{n} groups of {m} {b}s make {m * n} {b}s: <b>multiply the exponents</b>.</>}
      </p>
    </LabFrame>
  )
}
