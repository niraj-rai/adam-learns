import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ATOMIC_MASS, molarMass, parseFormula, pretty } from '../_shared/quantities'

const PALETTE = ['H', 'C', 'N', 'O', 'Na', 'Mg', 'S', 'Cl', 'K', 'Ca'] as const
const COLOUR: Record<string, string> = { H: '#e5e7eb', C: '#374151', N: '#3b82f6', O: '#ef4444', Na: '#a855f7', Mg: '#22c55e', S: '#eab308', Cl: '#10b981', K: '#8b5cf6', Ca: '#94a3b8' }
const TARGETS = [
  { name: 'Water', formula: 'H2O' },
  { name: 'Carbon dioxide', formula: 'CO2' },
  { name: 'Ammonia', formula: 'NH3' },
  { name: 'Methane (CNG)', formula: 'CH4' },
  { name: 'Common salt', formula: 'NaCl' },
  { name: 'Sulfuric acid', formula: 'H2SO4' },
  { name: 'Glucose', formula: 'C6H12O6' },
  { name: 'Limestone', formula: 'CaCO3' },
]

const toFormula = (counts: Record<string, number>) => {
  // Hill order: C, H first, then alphabetical; metals first for simple ionic ones
  const els = Object.keys(counts).filter((e) => counts[e] > 0)
  const metals = ['Na', 'K', 'Mg', 'Ca'].filter((m) => els.includes(m))
  const rest = els.filter((e) => !metals.includes(e))
  const order = [...metals, ...(rest.includes('C') ? ['C', ...rest.filter((e) => e === 'H'), ...rest.filter((e) => e !== 'C' && e !== 'H').sort()] : rest.sort((a, b) => (a === 'H' ? -1 : b === 'H' ? 1 : a.localeCompare(b))))]
  return order.map((e) => `${e}${counts[e] > 1 ? counts[e] : ''}`).join('')
}

export default function MolecularMass() {
  const [counts, setCounts] = useState<Record<string, number>>({ H: 2, O: 1 })
  const [ti, setTi] = useState(0)
  const [solved, setSolved] = useState<string[]>([])
  const total = Object.entries(counts).reduce((s, [e, n]) => s + ATOMIC_MASS[e] * n, 0)
  const target = TARGETS[ti]
  const same = (a: Record<string, number>, b: Record<string, number>) => Object.keys({ ...a, ...b }).every((k) => (a[k] ?? 0) === (b[k] ?? 0))
  const match = same(Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0)), parseFormula(target.formula))
  const add = (e: string, d: number) => setCounts((c) => ({ ...c, [e]: Math.max(0, Math.min(12, (c[e] ?? 0) + d)) }))
  const check = () => {
    if (match) { sfx.correct(); setSolved((s) => [...new Set([...s, target.formula])]) } else sfx.wrong()
  }
  const atoms = Object.entries(counts).flatMap(([e, n]) => Array.from({ length: n }, () => e))
  return (
    <LabFrame labId="molecular-mass" title="Molecule Mass Builder" subtitle="Molecular mass = the sum of the atomic masses of all the atoms in a molecule." howTo={<p>Build the target molecule by adding atoms, then press Check. The mass adds up as you go (in atomic mass units, u).</p>}>
      <div className="flex flex-wrap gap-1">
        {TARGETS.map((t, i) => <button key={t.formula} type="button" aria-pressed={ti === i} onClick={() => setTi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ti === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{solved.includes(t.formula) ? '✅ ' : ''}{t.name}</button>)}
      </div>
      <p className="mt-3 rounded-2xl bg-muted/50 p-3">Build <b>{target.name}</b>: {pretty(target.formula)}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {PALETTE.map((e) => (
          <div key={e} className="flex items-center justify-between gap-1 rounded-xl border px-2 py-1">
            <span className="grid size-8 place-items-center rounded-full text-xs font-bold" style={{ background: COLOUR[e], color: ['H', 'Ca', 'S'].includes(e) ? '#111' : '#fff' }}>{e}</span>
            <span className="text-[10px] text-muted-foreground">{ATOMIC_MASS[e]} u</span>
            <span className="flex items-center gap-1">
              <button type="button" aria-label={`remove ${e}`} onClick={() => add(e, -1)} className="size-6 rounded border hover:bg-muted">−</button>
              <span className="w-4 text-center font-mono text-sm">{counts[e] ?? 0}</span>
              <button type="button" aria-label={`add ${e}`} onClick={() => add(e, 1)} className="size-6 rounded border hover:bg-muted">+</button>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex min-h-16 flex-wrap items-center gap-1 rounded-2xl border bg-background p-3" aria-label="your molecule">
        {atoms.length ? atoms.map((e, i) => <span key={i} className="grid size-9 place-items-center rounded-full text-xs font-bold shadow" style={{ background: COLOUR[e], color: ['H', 'Ca', 'S'].includes(e) ? '#111' : '#fff' }}>{e}</span>) : <span className="text-sm text-muted-foreground">Add some atoms</span>}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Your formula" value={atoms.length ? pretty(toFormula(counts)) : '—'} />
        <Readout label="Molecular mass" value={<span className="text-base">{Object.entries(counts).filter(([, n]) => n).map(([e, n]) => `${n}×${ATOMIC_MASS[e]}`).join(' + ') || '0'} = <b>{total} u</b></span>} />
        <div className="flex items-center"><Button onClick={check}>Check</Button><span className="ml-2 text-sm">{match ? `✅ ${target.name}: ${molarMass(target.formula)} u` : ''}</span></div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Atomic masses are measured in <b>atomic mass units (u)</b>: 1 u is one-twelfth of the mass of a carbon-12 atom. For ionic compounds like NaCl, which don't form separate molecules, we call it the <b>formula unit mass</b>, but we add it up the same way.</p>
    </LabFrame>
  )
}
