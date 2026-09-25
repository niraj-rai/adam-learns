import { useState } from 'react'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ITEMS, type Role, ROLES } from './model'

export default function EcosystemBuilder() {
  const [sel, setSel] = useState<string | null>(null)
  const [placed, setPlaced] = useState<Record<string, Role>>({})
  const [wrong, setWrong] = useState<string | null>(null)
  const place = (r: Role) => {
    if (!sel) return
    const it = ITEMS.find((i) => i.id === sel)!
    if (it.role === r) { sfx.correct(); setPlaced((p) => ({ ...p, [sel]: r })); setSel(null); setWrong(null) }
    else { sfx.wrong(); setWrong(`${it.name} isn't a ${ROLES[r].name.toLowerCase()}. Think again!`) }
  }
  const done = Object.keys(placed).length === ITEMS.length
  return (
    <LabFrame labId="ecosystem-builder" title="Pond Ecosystem Builder" subtitle="An ecosystem is all the living things in a place, plus the non-living things they depend on." howTo={<p>Tap an item, then tap its role in the pond ecosystem.</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {ITEMS.filter((i) => !placed[i.id]).map((i) => <button key={i.id} type="button" onClick={() => setSel(i.id)} className={cn('rounded-full border px-3 py-1 text-sm', sel === i.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{i.emoji} {i.name}</button>)}
        {done && <span className="text-sm text-muted-foreground">Everything is in place!</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(ROLES) as Role[]).map((r) => (
          <button key={r} type="button" onClick={() => place(r)} className={cn('min-h-32 rounded-2xl border-2 border-dashed p-3 text-left', sel && 'border-chem')}>
            <p className="font-heading font-semibold">{ROLES[r].emoji} {ROLES[r].name}</p>
            <p className="text-xs text-muted-foreground">{ROLES[r].job}</p>
            <div className="mt-2 flex flex-wrap gap-1">{ITEMS.filter((i) => placed[i.id] === r).map((i) => <span key={i.id} className="rounded-full bg-success-soft px-2 py-0.5 text-xs">{i.emoji} {i.name}</span>)}</div>
          </button>
        ))}
      </div>
      {wrong && <p role="status" className="mt-3 rounded-lg bg-warn-soft px-3 py-2 text-sm">{wrong}</p>}
      <Readout className="mt-3" label="Placed" value={`${Object.keys(placed).length} / ${ITEMS.length}`} />
      {done && <p role="status" className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">✅ A complete ecosystem! Energy enters from the Sun through producers, passes to consumers, and decomposers recycle nutrients from dead matter back to the water and soil, so producers can use them again.</p>}
    </LabFrame>
  )
}
