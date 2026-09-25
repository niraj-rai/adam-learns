import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cubeStats, SPECIAL } from './model'

export default function CellShapes() {
  const [tab, setTab] = useState<'match' | 'size'>('match')
  return (
    <LabFrame labId="cell-shapes" title="Cells for Every Job" subtitle="A cell's shape fits its job. And there's a good reason why cells are so tiny." howTo={<p>Tab 1: match each specialised cell to its job. Tab 2: grow a cube-shaped “cell” and watch what happens to its surface area compared with its volume.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['match', '🧩 Shape fits job'], ['size', '📦 Why so small?']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'match' ? <Match /> : <Size />}
    </LabFrame>
  )
}

function Match() {
  const jobs = useMemo(() => shuffle(SPECIAL.map((s) => s.id)), [])
  const [sel, setSel] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const pickJob = (id: string) => {
    if (!sel) return
    if (id === sel) { setMatched((m) => [...m, id]); setSel(null); setWrong(null); sfx.correct() }
    else { setWrong(id); sfx.wrong() }
  }
  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Cells</p>
          {SPECIAL.map((s) => (
            <button key={s.id} type="button" disabled={matched.includes(s.id)} onClick={() => { setSel(s.id); setWrong(null) }} className={cn('w-full rounded-lg border px-3 py-2 text-left text-sm', sel === s.id && 'border-chem bg-chem-soft', matched.includes(s.id) && 'border-success bg-success-soft')}>
              {s.emoji} <b>{s.name}</b><span className="block text-xs text-muted-foreground">{s.shape}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">Jobs</p>
          {jobs.map((id) => {
            const s = SPECIAL.find((x) => x.id === id)!
            return <button key={id} type="button" disabled={matched.includes(id)} onClick={() => pickJob(id)} className={cn('w-full rounded-lg border px-3 py-2 text-left text-sm', matched.includes(id) && 'border-success bg-success-soft opacity-70', wrong === id && 'border-destructive bg-destructive/10')}>{s.job}</button>
          })}
        </div>
      </div>
      <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', matched.length === SPECIAL.length ? 'bg-success-soft' : 'bg-chem-soft')}>{matched.length === SPECIAL.length ? '✅ All matched! In multicellular organisms, cells are specialised: their shape and structure suit a particular job.' : 'Tap a cell, then tap the job it is shaped for.'}</p>
    </div>
  )
}

function Size() {
  const [s, setS] = useState(2)
  const st = cubeStats(s)
  const px = 20 + s * 14
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="grid place-items-center rounded-2xl border bg-background p-4">
        <svg viewBox="0 0 200 200" className="w-56" role="img" aria-label={`Cube of side ${s}`}>
          <g transform={`translate(${100 - px / 2} ${110 - px / 2})`}>
            <polygon points={`0,0 ${px},0 ${px + px * 0.35},${-px * 0.35} ${px * 0.35},${-px * 0.35}`} fill="#bbf7d0" stroke="#15803d" />
            <polygon points={`${px},0 ${px + px * 0.35},${-px * 0.35} ${px + px * 0.35},${px - px * 0.35} ${px},${px}`} fill="#86efac" stroke="#15803d" />
            <rect width={px} height={px} fill="#dcfce7" stroke="#15803d" />
          </g>
        </svg>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">Side length: <b>{s} units</b>
          <Slider value={[s]} min={1} max={10} step={1} onValueChange={([v]) => setS(v)} className="mt-1.5" aria-label="Side length" />
        </label>
        <Readout label="Surface area (6 × side²)" value={st.area} />
        <Readout label="Volume (side³)" value={st.volume} />
        <Readout label="Surface area ÷ volume" value={st.ratio.toFixed(2)} />
        <Button size="sm" variant="outline" onClick={() => setS(1)}>Reset to 1</Button>
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">A cell takes in food and oxygen, and gets rid of waste, through its <b>surface</b> (the membrane). But the stuff that needs feeding is its <b>volume</b>. As a cell gets bigger, its volume grows much faster than its surface, so the surface can't keep up. That's why living things are made of many tiny cells instead of a few giant ones.</p>
    </div>
  )
}
