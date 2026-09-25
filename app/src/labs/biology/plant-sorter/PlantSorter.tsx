import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { HABIT_TEXT, type Plant, PLANTS } from './model'

type Key = 'habit' | 'root' | 'venation'
const BINS: Record<Key, string[]> = { habit: ['herb', 'shrub', 'tree'], root: ['taproot', 'fibrous'], venation: ['reticulate', 'parallel'] }
const LABEL: Record<Key, string> = { habit: 'Height and stem', root: 'Root system', venation: 'Leaf veins' }

export default function PlantSorter() {
  const [key, setKey] = useState<Key>('habit')
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [sel, setSel] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = PLANTS.filter((p) => placed[p.id] === p[key]).length
  const switchKey = (k: Key) => { setKey(k); setPlaced({}); setChecked(false); setSel(null) }
  const drop = (bin: string) => { if (sel) { setPlaced((x) => ({ ...x, [sel]: bin })); setSel(null); setChecked(false) } }
  const check = () => { setChecked(true); if (correct === PLANTS.length) sfx.win(); else sfx.click() }
  const all = Object.keys(placed).length === PLANTS.length

  return (
    <LabFrame labId="plant-sorter" title="Plant Sorter" subtitle="Scientists group plants by their features. Can you spot a hidden pattern?" howTo={<p>Choose a feature to sort by. Tap a plant, then tap the group it belongs to. Check your answers. After sorting by BOTH roots and leaf veins, look for a pattern!</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {(Object.keys(BINS) as Key[]).map((k) => <Button key={k} size="sm" variant={k === key ? 'default' : 'outline'} onClick={() => switchKey(k)}>{LABEL[k]}</Button>)}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {PLANTS.filter((p) => !placed[p.id]).map((p) => (
          <button key={p.id} type="button" onClick={() => setSel(p.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', sel === p.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.emoji} {p.name}</button>
        ))}
        {!PLANTS.some((p) => !placed[p.id]) && <span className="text-sm text-muted-foreground">All plants sorted.</span>}
      </div>
      <div className={cn('grid gap-3', BINS[key].length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
        {BINS[key].map((b) => (
          <button key={b} type="button" onClick={() => drop(b)} className={cn('min-h-28 rounded-2xl border-2 border-dashed p-3 text-left', sel && 'border-chem')}>
            <p className="font-heading font-semibold capitalize">{b}</p>
            <p className="text-xs text-muted-foreground">{key === 'habit' ? HABIT_TEXT[b as Plant['habit']] : b === 'taproot' ? 'One main thick root with side roots' : b === 'fibrous' ? 'A bunch of thin roots of similar size' : b === 'reticulate' ? 'Veins form a net' : 'Veins run side by side'}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {PLANTS.filter((p) => placed[p.id] === b).map((p) => (
                <span key={p.id} className={cn('rounded-full border px-2 py-0.5 text-xs', checked && (p[key] === b ? 'border-success bg-success-soft' : 'border-destructive bg-destructive/10'))}>{p.emoji} {p.name}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={check} disabled={!all}>✔ Check</Button>
        <Button variant="ghost" onClick={() => { setPlaced({}); setChecked(false) }}>↺ Reset</Button>
        {checked && <Readout label="Correct" value={`${correct} / ${PLANTS.length}`} />}
      </div>
      {checked && key !== 'habit' && correct === PLANTS.length && (
        <p role="status" className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">🔍 <b>Pattern:</b> every plant with <b>parallel</b> veins has <b>fibrous</b> roots, and every plant with <b>reticulate</b> (net-like) veins has a <b>taproot</b>. Botanists call the first group <b>monocots</b> (one seed leaf: grasses, rice, onion, coconut) and the second <b>dicots</b> (two seed leaves: mango, neem, mustard). Split a soaked chana seed: it has two halves, so it's a dicot!</p>
      )}
      {checked && key === 'habit' && <p className="mt-3 text-sm text-muted-foreground">Note: the coconut palm is a tree, yet it has fibrous roots and parallel veins. Height alone doesn't tell you everything!</p>}
    </LabFrame>
  )
}
