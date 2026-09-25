import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ADD_NAMES, BASES, RECIPES, matchAlloy, type Add, type Metal } from './model'

function Bar({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div className="h-full rounded-full bg-chem" animate={{ width: `${(v / 10) * 100}%` }} />
      </div>
    </div>
  )
}

export default function AlloyWorkshop() {
  const [base, setBase] = useState<Metal>('Cu')
  const [amounts, setAmounts] = useState<Partial<Record<Add, number>>>({})
  const [found, setFound] = useState<string[]>([])
  const b = BASES[base]
  const total = Object.entries(amounts).filter(([k]) => b.adds.includes(k as Add)).reduce((a, [, v]) => a + (v ?? 0), 0)
  const basePct = Math.max(0, 100 - total)

  const match = matchAlloy(base, amounts)
  const isAlloy = total > 0
  const props = match ?? { hardness: isAlloy ? Math.min(10, b.hardness + 2) : b.hardness, rust: b.rust, mp: isAlloy ? b.mp - 60 : b.mp, colour: b.colour, name: isAlloy ? 'Unnamed alloy' : `Pure ${b.name.toLowerCase()}`, uses: '' }
  const karat = base === 'Au' ? (24 * basePct) / 100 : null

  useEffect(() => {
    if (!match) return
    setFound((f) => {
      if (f.includes(match.name)) return f
      sfx.win()
      return [...f, match.name]
    })
  }, [match])

  return (
    <LabFrame
      labId="alloy-workshop"
      title="Alloy Workshop"
      subtitle="Mix metals (and carbon) to make alloys. Can you discover all 6 recipes?"
      howTo={<p>Choose a base metal, then add small amounts of other elements with the sliders. When your mix matches a real alloy, it will be named. Compare how the properties change.</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(BASES) as Metal[]).map((m) => (
          <button key={m} type="button" onClick={() => { setBase(m); setAmounts({}) }} className={cn('rounded-full border px-3 py-1.5 text-sm', base === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {BASES[m].name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          {b.adds.map((a) => (
            <label key={a} className="block text-sm">
              Add {ADD_NAMES[a]}: <b>{(amounts[a] ?? 0).toFixed(a === 'C' ? 1 : 0)}%</b>
              <Slider value={[amounts[a] ?? 0]} min={0} max={a === 'C' ? 3 : 50} step={a === 'C' ? 0.1 : 1} onValueChange={([v]) => setAmounts((x) => ({ ...x, [a]: v }))} className="mt-1.5" aria-label={`${ADD_NAMES[a]} percentage`} />
            </label>
          ))}
          <p className="text-sm text-muted-foreground">
            Mix: {b.name} {basePct.toFixed(1)}%{b.adds.filter((a) => (amounts[a] ?? 0) > 0).map((a) => ` + ${ADD_NAMES[a]} ${(amounts[a] ?? 0).toFixed(a === 'C' ? 1 : 0)}%`).join('')}
          </p>
          {karat !== null && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/40">
              🪙 Gold purity: <b>{karat.toFixed(1)} carat</b> ({basePct.toFixed(1)}% gold). Indian jewellery hallmarks: 22K = <b>916</b> (91.6% gold), 18K = 750.
            </p>
          )}
        </div>
        <div className="space-y-3 rounded-2xl border bg-background p-4">
          <div className="flex items-center gap-3">
            <motion.div className="size-14 rounded-xl border-2 border-black/20" animate={{ background: props.colour }} />
            <div>
              <p className="font-heading text-lg font-semibold">{props.name}</p>
              {match && <p className="text-xs text-success">✨ Real alloy discovered!</p>}
            </div>
          </div>
          <Bar label="Hardness / strength" v={props.hardness} />
          <Bar label="Corrosion resistance" v={props.rust * 2} />
          <p className="text-xs text-muted-foreground">Melting point ≈ {props.mp} °C (pure {b.name.toLowerCase()}: {b.mp} °C)</p>
          {match && <p className="text-sm"><b>Used for:</b> {match.uses}</p>}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold">Recipes discovered: {found.length} / {RECIPES.length}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {RECIPES.map((r) => (
            <span key={r.name} className={cn('rounded-full border px-3 py-1 text-xs', found.includes(r.name) ? 'border-success bg-success-soft font-semibold' : 'text-muted-foreground')}>
              {found.includes(r.name) ? `✅ ${r.name}` : `❔ ${r.base === 'Fe' ? 'Iron' : BASES[r.base].name}-based alloy`}
            </span>
          ))}
        </div>
      </div>
    </LabFrame>
  )
}
