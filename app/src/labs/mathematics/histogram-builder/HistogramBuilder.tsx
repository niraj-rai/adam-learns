import { useMemo, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { groupedMean } from '../_shared/sequences'
import { mean, median, rng } from '../_shared/stats'

const DATASETS = [
  { name: 'Heights of 40 students (cm)', emoji: '📏', gen: (r: () => number) => Array.from({ length: 40 }, () => Math.round(140 + 25 * ((r() + r() + r()) / 3))) },
  { name: 'Daily screen time of 50 teens (min)', emoji: '📱', gen: (r: () => number) => Array.from({ length: 50 }, () => Math.round(30 + 240 * r() ** 1.6)) },
  { name: 'Marks out of 100 (60 students)', emoji: '📝', gen: (r: () => number) => Array.from({ length: 60 }, () => Math.min(100, Math.round(35 + 60 * ((r() + r()) / 2)))) },
]

export default function HistogramBuilder() {
  const [di, setDi] = useState(0)
  const [seed, setSeed] = useState(7)
  const [width, setWidth] = useState(5)
  const data = useMemo(() => DATASETS[di].gen(rng(seed)), [di, seed])
  const lo = Math.floor(Math.min(...data) / width) * width
  const hi = Math.max(...data)
  const classes = Array.from({ length: Math.floor((hi - lo) / width) + 1 }, (_, i) => ({ lo: lo + i * width, hi: lo + (i + 1) * width, f: 0 }))
  for (const x of data) classes[Math.min(classes.length - 1, Math.floor((x - lo) / width))].f++
  const maxF = Math.max(...classes.map((c) => c.f))
  const modal = classes.find((c) => c.f === maxF)!
  return (
    <LabFrame labId="histogram-builder" title="Histogram Builder" subtitle="Group data into classes, draw a histogram, and estimate the mean from grouped data." howTo={<p>Pick a data set and change the class width. Watch the histogram's shape change, and compare the grouped estimate of the mean with the exact mean.</p>}>
      <div className="flex flex-wrap gap-1">
        {DATASETS.map((d, i) => <button key={d.name} type="button" aria-pressed={di === i} onClick={() => { setDi(i); setWidth(i === 1 ? 30 : i === 2 ? 10 : 5) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', di === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{d.emoji} {d.name}</button>)}
        <button type="button" onClick={() => setSeed((s) => s + 1)} className="rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">🎲 New sample</button>
      </div>
      <label className="mt-3 block text-sm">Class width <b>{width}</b><Slider value={[width]} min={di === 1 ? 10 : 2} max={di === 1 ? 60 : 20} step={di === 1 ? 10 : 1} onValueChange={([v]) => setWidth(v)} className="mt-1" aria-label="class width" /></label>
      <div className="mt-3 flex h-44 items-end gap-0 overflow-x-auto rounded-2xl border px-2 pb-6 pt-2" aria-label="histogram">
        {classes.map((c) => <div key={c.lo} className="relative flex min-w-6 flex-1 flex-col items-center justify-end"><span className="text-[10px]">{c.f || ''}</span><div className={cn('w-full border border-background bg-chem', c === modal && 'bg-brand')} style={{ height: `${(c.f / maxF) * 130}px` }} /><span className="absolute -bottom-5 left-0 -translate-x-1/2 text-[9px] text-muted-foreground">{c.lo}</span></div>)}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-center text-xs">
          <thead><tr className="text-muted-foreground"><th className="p-1">Class</th>{classes.map((c) => <th key={c.lo} className="p-1 font-normal">{c.lo}–{c.hi}</th>)}</tr></thead>
          <tbody><tr><td className="p-1 font-semibold">f</td>{classes.map((c) => <td key={c.lo} className="p-1">{c.f}</td>)}</tr></tbody>
        </table>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Readout label="Number of values" value={data.length} />
        <Readout label="Exact mean" value={mean(data).toFixed(1)} />
        <Readout label="Grouped estimate" value={groupedMean(classes).toFixed(1)} />
        <Readout label="Modal class" value={`${modal.lo}–${modal.hi}`} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Median of the raw data: {median(data)}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>histogram</b> is a bar graph for grouped continuous data: the bars touch because the classes follow on with no gaps. With grouped data we don't know the exact values, so we estimate the mean using each class's <b>midpoint</b>: mean ≈ Σ(f × midpoint) ÷ Σf. Too few classes hide the shape; too many make it noisy.</p>
    </LabFrame>
  )
}
