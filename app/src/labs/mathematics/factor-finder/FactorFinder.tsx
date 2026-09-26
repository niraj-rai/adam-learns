import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { divideByLinear, evaluate, format, integerZeros, type Poly } from '../_shared/poly'

const PRESETS: { p: Poly; label: string }[] = [
  { p: [-6, 11, -6, 1], label: 'x³ − 6x² + 11x − 6' },
  { p: [6, -5, 1], label: 'x² − 5x + 6' },
  { p: [-12, -4, 3, 1], label: 'x³ + 3x² − 4x − 12' },
  { p: [4, 0, -5, 0, 1], label: 'x⁴ − 5x² + 4' },
  { p: [-8, 0, 0, 1], label: 'x³ − 8' },
]
const lin = (a: number) => (a === 0 ? 'x' : a > 0 ? `(x − ${a})` : `(x + ${-a})`)

export default function FactorFinder() {
  const [pi, setPi] = useState(0)
  const [a, setA] = useState(1)
  const p = PRESETS[pi].p
  const { quotient, remainder } = divideByLinear(p, a)
  const hi = [...p].reverse()
  const row: number[] = []
  let carry = 0
  for (const c of hi) { carry = c + carry * a; row.push(carry) }
  const zeros = integerZeros(p)
  return (
    <LabFrame labId="factor-finder" title="Factor Finder" subtitle="Remainder theorem: dividing p(x) by (x − a) leaves remainder p(a). If p(a) = 0, then (x − a) is a factor." howTo={<p>Choose a polynomial and try values of a. Synthetic division shows the quotient and remainder. Find every a that gives remainder 0.</p>}>
      <div className="flex flex-wrap gap-1">{PRESETS.map((x, i) => <button key={x.label} type="button" aria-pressed={pi === i} onClick={() => setPi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', pi === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.label}</button>)}</div>
      <label className="mt-3 block text-sm">Try dividing by (x − a), a = <b>{a}</b><Slider value={[a]} min={-6} max={6} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="a" /></label>
      <div className="mt-3 overflow-x-auto rounded-2xl border p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase">Synthetic division by {lin(a)}</p>
        <table className="mt-2 font-mono text-sm">
          <tbody>
            <tr><td className="pr-3 text-chem font-bold">{a}</td>{hi.map((c, i) => <td key={i} className="px-3 text-center">{fmt(c)}</td>)}</tr>
            <tr><td /><td className="px-3" />{row.slice(0, -1).map((r, i) => <td key={i} className="px-3 text-center text-muted-foreground">{fmt(r * a)}</td>)}</tr>
            <tr className="border-t">{[<td key="x" />, ...row.map((r, i) => <td key={i} className={cn('px-3 text-center font-bold', i === row.length - 1 && (remainder === 0 ? 'text-success' : 'text-destructive'))}>{fmt(r)}</td>)]}</tr>
          </tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Quotient" value={format(quotient)} />
        <Readout label={`Remainder = p(${a})`} value={`${fmt(remainder)} (check: ${fmt(evaluate(p, a))})`} />
        <Readout label="Is (x − a) a factor?" value={remainder === 0 ? `✅ Yes: ${lin(a)}` : '❌ No'} />
      </div>
      <p className="mt-3 rounded-xl bg-muted/60 px-4 py-2 text-sm">Zeros found so far between −12 and 12: {zeros.length ? zeros.map(lin).join(' · ') : 'none'}. {zeros.length && zeros.length === PRESETS[pi].p.length - 1 ? <>So <b>{PRESETS[pi].label} = {zeros.map(lin).join('')}</b>.</> : 'Some factors may be quadratics with no whole-number zeros.'}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Good values of a to try are the <b>divisors of the constant term</b> (for x³ − 6x² + 11x − 6, try ±1, ±2, ±3, ±6). This is the <b>factor theorem</b>: (x − a) is a factor of p(x) exactly when p(a) = 0.</p>
    </LabFrame>
  )
}
