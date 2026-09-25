import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { checkCell, type OrganelleId, ORGANELLES } from './model'

function CellDrawing({ kind, parts }: { kind: 'plant' | 'animal'; parts: OrganelleId[] }) {
  const has = (o: OrganelleId) => parts.includes(o)
  const plant = kind === 'plant'
  const shape = plant ? 'M40 30 H260 V190 H40 Z' : 'M150 30 C 230 25, 275 80, 262 125 C 250 175, 190 200, 140 192 C 80 185, 35 150, 42 105 C 48 60, 90 33, 150 30 Z'
  return (
    <svg viewBox="0 0 300 220" className="w-full max-w-md" role="img" aria-label={`${kind} cell with: ${parts.join(', ') || 'nothing yet'}`}>
      {has('wall') && <path d="M32 22 H268 V198 H32 Z" fill="#bbf7d0" stroke="#15803d" strokeWidth={6} />}
      <path d={shape} fill={has('cytoplasm') ? '#fef9c3' : 'var(--card)'} stroke={has('membrane') ? '#ca8a04' : '#94a3b8'} strokeWidth={has('membrane') ? 3 : 1} strokeDasharray={has('membrane') ? undefined : '5 5'} />
      {has('vacuole') && <motion.rect initial={{ scale: 0 }} animate={{ scale: 1 }} x={110} y={55} width={120} height={110} rx={30} fill="#bae6fd" stroke="#0284c7" />}
      {has('nucleus') && <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }}><circle cx={plant ? 75 : 145} cy={plant ? 70 : 110} r={22} fill="#c4b5fd" stroke="#6d28d9" strokeWidth={2} /><circle cx={plant ? 78 : 148} cy={plant ? 67 : 107} r={6} fill="#6d28d9" /></motion.g>}
      {has('mitochondria') && [[80, 160], [200, 180], [245, 60], [60, 120]].map(([x, y], i) => <motion.ellipse key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} cx={plant ? x : x * 0.9 + 20} cy={plant ? y : y * 0.8 + 20} rx={12} ry={6} fill="#fb923c" stroke="#c2410c" transform={`rotate(${i * 40} ${x} ${y})`} />)}
      {has('chloroplast') && [[60, 50], [95, 180], [245, 100], [250, 170], [55, 180], [160, 180], [245, 40]].map(([x, y], i) => <motion.ellipse key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} cx={x} cy={y} rx={11} ry={7} fill="#22c55e" stroke="#15803d" />)}
    </svg>
  )
}

export default function CellBuilder() {
  const addXp = useProgress((s) => s.addXp)
  const [kind, setKind] = useState<'plant' | 'animal'>('animal')
  const [parts, setParts] = useState<OrganelleId[]>([])
  const [result, setResult] = useState<ReturnType<typeof checkCell> | null>(null)
  const [done, setDone] = useState<string[]>([])
  const [info, setInfo] = useState<string | null>(null)
  const toggle = (id: OrganelleId) => {
    setResult(null)
    setParts((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
    setInfo(ORGANELLES.find((o) => o.id === id)!.job)
  }
  const check = () => {
    const r = checkCell(kind, parts)
    setResult(r)
    if (r.complete) {
      sfx.win()
      if (!done.includes(kind)) { setDone((d) => [...d, kind]); addXp(10, `Built a ${kind} cell`) }
    } else sfx.wrong()
  }
  const name = (id: OrganelleId) => ORGANELLES.find((o) => o.id === id)!.name.toLowerCase()
  return (
    <LabFrame labId="cell-builder" title="Cell Builder" subtitle="Build a plant cell and an animal cell. Which parts do they share, and which belong only to plants?" howTo={<p>Choose plant or animal. Add the parts you think belong in that cell. Tap a part to read what it does. Then check your cell. Build both to spot the three differences.</p>}>
      <div className="mb-3 flex gap-2">
        {(['animal', 'plant'] as const).map((k) => <Button key={k} variant={k === kind ? 'default' : 'outline'} onClick={() => { setKind(k); setParts([]); setResult(null) }}>{done.includes(k) ? '✅ ' : ''}{k === 'animal' ? '🐾 Animal cell' : '🌿 Plant cell'}</Button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="grid place-items-center rounded-2xl border bg-background p-3"><CellDrawing kind={kind} parts={parts} /></div>
        <div className="space-y-1.5">
          {ORGANELLES.map((o) => (
            <button key={o.id} type="button" onClick={() => toggle(o.id)} aria-pressed={parts.includes(o.id)} className={cn('w-full rounded-lg border px-3 py-1.5 text-left text-sm', parts.includes(o.id) ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', result && parts.includes(o.id) && result.wrong.includes(o.id) && 'border-destructive bg-destructive/10')}>{o.emoji} {o.name}</button>
          ))}
          <Button className="mt-2 w-full" onClick={check} disabled={!parts.length}>🔬 Check my cell</Button>
        </div>
      </div>
      {info && !result && <p className="mt-3 rounded-lg border border-dashed px-3 py-2 text-sm">{info}</p>}
      {result && (
        <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', result.complete ? 'bg-success-soft' : 'bg-warn-soft')}>
          {result.complete
            ? kind === 'plant' ? '✅ A complete plant cell! Compared with an animal cell, it also has a cell wall, chloroplasts and a large central vacuole.' : '✅ A complete animal cell: membrane, cytoplasm, nucleus and mitochondria. No cell wall, no chloroplasts.'
            : `Not quite. ${result.wrong.length ? `A ${kind} cell doesn’t have: ${result.wrong.map(name).join(', ')}. ` : ''}${result.missing.length ? `Still missing ${result.missing.length} part${result.missing.length > 1 ? 's' : ''}.` : ''}`}
        </p>
      )}
    </LabFrame>
  )
}
