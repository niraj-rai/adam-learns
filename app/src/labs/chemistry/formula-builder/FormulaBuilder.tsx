import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { Chem } from '@/components/lesson'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const ELEMENTS = [
  { s: 'H', name: 'hydrogen', color: '#f8fafc', r: 9 },
  { s: 'C', name: 'carbon', color: '#334155', r: 12 },
  { s: 'N', name: 'nitrogen', color: '#3b82f6', r: 12 },
  { s: 'O', name: 'oxygen', color: '#ef4444', r: 12 },
  { s: 'Na', name: 'sodium', color: '#a855f7', r: 12 },
  { s: 'Mg', name: 'magnesium', color: '#84cc16', r: 12 },
  { s: 'S', name: 'sulfur', color: '#eab308', r: 13 },
  { s: 'Cl', name: 'chlorine', color: '#22c55e', r: 13 },
  { s: 'Ca', name: 'calcium', color: '#f97316', r: 13 },
] as const
type Sym = (typeof ELEMENTS)[number]['s']

const TARGETS: { name: string; formula: Partial<Record<Sym, number>>; where: string }[] = [
  { name: 'Water', formula: { H: 2, O: 1 }, where: 'Everywhere! Oceans, rivers, you.' },
  { name: 'Carbon dioxide', formula: { C: 1, O: 2 }, where: 'You breathe it out; plants use it.' },
  { name: 'Oxygen gas', formula: { O: 2 }, where: 'In the air; needed for burning and breathing.' },
  { name: 'Table salt (sodium chloride)', formula: { Na: 1, Cl: 1 }, where: 'In your salt shaker and sea water.' },
  { name: 'Methane', formula: { C: 1, H: 4 }, where: 'The main gas in CNG and biogas.' },
  { name: 'Ammonia', formula: { N: 1, H: 3 }, where: 'Used to make fertilisers like urea.' },
  { name: 'Magnesium oxide', formula: { Mg: 1, O: 1 }, where: 'The white ash when magnesium ribbon burns.' },
  { name: 'Calcium carbonate', formula: { Ca: 1, C: 1, O: 3 }, where: 'Chalk, marble and limestone.' },
  { name: 'Sulfuric acid', formula: { H: 2, S: 1, O: 4 }, where: 'In car batteries; a very strong acid.' },
  { name: 'Glucose', formula: { C: 6, H: 12, O: 6 }, where: 'The sugar plants make by photosynthesis.' },
]

const ORDER: Sym[] = ['Na', 'Mg', 'Ca', 'C', 'N', 'H', 'S', 'Cl', 'O']

function toFormula(counts: Partial<Record<Sym, number>>, order: Sym[]) {
  return order
    .filter((s) => (counts[s] ?? 0) > 0)
    .map((s) => `${s}${counts[s]! > 1 ? counts[s] : ''}`)
    .join('')
}

export default function FormulaBuilder() {
  const [ti, setTi] = useState(0)
  const [counts, setCounts] = useState<Partial<Record<Sym, number>>>({})
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [solved, setSolved] = useState<number[]>([])
  const target = TARGETS[ti]
  const targetOrder = Object.keys(target.formula) as Sym[]
  const displayOrder = [...targetOrder, ...ORDER.filter((s) => !targetOrder.includes(s))]
  const built = toFormula(counts, displayOrder)
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0)

  const change = (s: Sym, d: number) => {
    setCounts((c) => ({ ...c, [s]: Math.max(0, Math.min(12, (c[s] ?? 0) + d)) }))
    setResult(null)
  }

  const check = () => {
    const keys = new Set([...Object.keys(counts), ...Object.keys(target.formula)] as Sym[])
    const ok = [...keys].every((k) => (counts[k] ?? 0) === (target.formula[k] ?? 0))
    setResult(ok ? 'right' : 'wrong')
    ;(ok ? sfx.correct : sfx.wrong)()
    if (ok && !solved.includes(ti)) setSolved((s) => [...s, ti])
  }

  const diff = (() => {
    const out: string[] = []
    for (const s of new Set([...Object.keys(counts), ...Object.keys(target.formula)] as Sym[])) {
      const have = counts[s] ?? 0
      const need = target.formula[s] ?? 0
      if (have < need) out.push(`more ${ELEMENTS.find((e) => e.s === s)!.name}`)
      if (have > need) out.push(`fewer ${ELEMENTS.find((e) => e.s === s)!.name}`)
    }
    return out
  })()

  const atoms = displayOrder.flatMap((s) => Array.from({ length: counts[s] ?? 0 }, () => ELEMENTS.find((e) => e.s === s)!))

  return (
    <LabFrame
      labId="formula-builder"
      title="Formula Builder"
      subtitle="Build molecules atom by atom and write their formulas"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Read the name and the formula of the target substance.</li>
          <li>Use + and − to add the right number of each kind of atom.</li>
          <li>The small number after a symbol tells you how many of that atom. No number means 1.</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TARGETS.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => {
              setTi(i)
              setCounts({})
              setResult(null)
            }}
            className={cn('rounded-full border px-2.5 py-1 text-xs', i === ti ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
          >
            {t.name.split(' (')[0]} {solved.includes(i) && '✅'}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="rounded-xl border bg-chem-soft p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Target</p>
            <p className="font-heading text-2xl font-semibold">
              {target.name} · <Chem>{toFormula(target.formula, targetOrder)}</Chem>
            </p>
            <p className="text-sm text-muted-foreground">{target.where}</p>
          </div>

          <div className="flex min-h-36 flex-wrap content-start items-center gap-1 rounded-xl border-2 border-dashed bg-background p-4" aria-label={`Your atoms: ${built || 'none yet'}`}>
            {atoms.length === 0 && <span className="text-sm text-muted-foreground">Add atoms with the buttons →</span>}
            {atoms.map((e, i) => (
              <motion.span
                key={`${e.s}-${i}`}
                layout
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="grid place-items-center rounded-full border border-black/30 text-[10px] font-bold"
                style={{ width: e.r * 2.4, height: e.r * 2.4, background: e.color, color: e.s === 'H' ? '#334155' : '#fff' }}
              >
                {e.s}
              </motion.span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-lg">
              Your formula: <b className="font-heading text-xl">{built ? <Chem>{built}</Chem> : '—'}</b>
              <span className="ml-2 text-sm text-muted-foreground">({total} atoms)</span>
            </p>
            <Button onClick={check} disabled={total === 0}>
              Check
            </Button>
          </div>
          {result && (
            <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', result === 'right' ? 'bg-success-soft' : 'bg-warn-soft')}>
              {result === 'right' ? `✅ Perfect! One molecule of ${target.name.toLowerCase()} has ${total} atoms.` : `Not yet. You need ${diff.join(', ')}.`}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-1.5 self-start">
          {ELEMENTS.map((e) => (
            <div key={e.s} className="flex items-center gap-2 rounded-lg border bg-background px-2 py-1">
              <span className="grid size-7 place-items-center rounded-full border border-black/30 text-[11px] font-bold" style={{ background: e.color, color: e.s === 'H' ? '#334155' : '#fff' }}>
                {e.s}
              </span>
              <span className="flex-1 text-sm capitalize">{e.name}</span>
              <Button size="icon-sm" variant="ghost" onClick={() => change(e.s, -1)} aria-label={`Remove ${e.name}`} disabled={!counts[e.s]}>
                <Minus />
              </Button>
              <span className="w-5 text-center tabular-nums">{counts[e.s] ?? 0}</span>
              <Button size="icon-sm" variant="ghost" onClick={() => change(e.s, 1)} aria-label={`Add ${e.name}`}>
                <Plus />
              </Button>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">Molecules built: <b className="text-foreground">{solved.length}</b> / {TARGETS.length}</p>
    </LabFrame>
  )
}
