import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { EQUATIONS, atomCounts, isBalanced, solve } from '../_shared/equations'
import { pretty } from '../_shared/quantities'

export default function EquationBalancer() {
  const [ei, setEi] = useState(0)
  const eq = EQUATIONS[ei]
  const n = eq.reactants.length + eq.products.length
  const [c, setC] = useState<number[]>(Array(n).fill(1))
  const [solved, setSolved] = useState<string[]>([])
  const [hint, setHint] = useState(false)
  const pick = (i: number) => { setEi(i); setC(Array(EQUATIONS[i].reactants.length + EQUATIONS[i].products.length).fill(1)); setHint(false) }
  const bump = (k: number, d: number) => {
    const next = c.map((x, i) => (i === k ? Math.max(1, Math.min(12, x + d)) : x))
    setC(next)
    if (isBalanced(eq, next)) { sfx.correct(); setSolved((s) => [...new Set([...s, eq.name])]) } else sfx.click()
  }
  const left = atomCounts(eq.reactants, c.slice(0, eq.reactants.length))
  const right = atomCounts(eq.products, c.slice(eq.reactants.length))
  const els = [...new Set([...Object.keys(left), ...Object.keys(right)])]
  const ok = isBalanced(eq, c)
  const answer = solve(eq, 12)
  const Term = ({ f, k }: { f: string; k: number }) => (
    <span className="inline-flex items-center gap-1 rounded-xl border-2 bg-background px-2 py-1">
      <button type="button" aria-label={`decrease ${f}`} onClick={() => bump(k, -1)} className="size-6 rounded border hover:bg-muted">−</button>
      <span className="w-5 text-center font-heading text-xl text-chem">{c[k] > 1 ? c[k] : ''}</span>
      <span className="font-mono text-lg">{pretty(f)}</span>
      <button type="button" aria-label={`increase ${f}`} onClick={() => bump(k, 1)} className="size-6 rounded border hover:bg-muted">+</button>
    </span>
  )
  return (
    <LabFrame labId="equation-balancer" title="Equation Balancer" subtitle="Atoms are never created or destroyed, so both sides of an equation must have the same number of each kind of atom." howTo={<p>Pick a reaction. Change the big numbers (coefficients) in front of each formula until every atom balances. Never change the small numbers inside a formula!</p>}>
      <div className="flex flex-wrap gap-1">{EQUATIONS.map((e, i) => <button key={e.name} type="button" aria-pressed={ei === i} onClick={() => pick(i)} className={cn('rounded-lg border-2 px-2 py-1 text-xs', ei === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(e.name) ? '✅ ' : ''}{e.name}</button>)}</div>
      <p className="mt-3 text-xs font-semibold text-muted-foreground uppercase">{eq.type} reaction</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 rounded-2xl border p-3">
        {eq.reactants.map((f, i) => <span key={`r${i}`} className="flex items-center gap-2">{i > 0 && <span className="text-xl">+</span>}<Term f={f} k={i} /></span>)}
        <span className="text-2xl">→</span>
        {eq.products.map((f, i) => <span key={`p${i}`} className="flex items-center gap-2">{i > 0 && <span className="text-xl">+</span>}<Term f={f} k={eq.reactants.length + i} /></span>)}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[300px] text-center text-sm">
          <thead><tr className="text-xs text-muted-foreground"><th className="p-1">Atom</th><th className="p-1">Left</th><th className="p-1">Right</th><th /></tr></thead>
          <tbody>{els.map((el) => <tr key={el} className="border-t"><td className="p-1 font-semibold">{el}</td><td className="p-1 font-mono">{left[el] ?? 0}</td><td className="p-1 font-mono">{right[el] ?? 0}</td><td>{(left[el] ?? 0) === (right[el] ?? 0) ? '✅' : '❌'}</td></tr>)}</tbody>
        </table>
      </div>
      <div className={cn('mt-3 rounded-xl px-4 py-2 text-sm', ok ? 'bg-success-soft' : 'bg-muted/60')}>
        {ok ? <>✅ Balanced! {eq.reactants.map((f, i) => `${c[i] > 1 ? c[i] : ''}${pretty(f)}`).join(' + ')} → {eq.products.map((f, i) => `${c[eq.reactants.length + i] > 1 ? c[eq.reactants.length + i] : ''}${pretty(f)}`).join(' + ')}</> : <>Balance one element at a time. Leave hydrogen and oxygen until last, and treat groups like SO₄ as a single unit.</>}
      </div>
      {!ok && <Button className="mt-2" size="sm" variant="ghost" onClick={() => setHint((h) => !h)}>{hint ? 'Hide hint' : '💡 Hint'}</Button>}
      {hint && answer && !ok && <p className="mt-1 text-sm text-muted-foreground">The first coefficient is {answer[0]}.</p>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A balanced equation obeys the <b>law of conservation of mass</b>. You can also add state symbols: (s) solid, (l) liquid, (g) gas and (aq) dissolved in water, e.g. Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g).</p>
    </LabFrame>
  )
}
