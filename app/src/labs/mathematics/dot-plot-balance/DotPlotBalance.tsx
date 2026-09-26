import { useState, type MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { mean, median, modes, range } from '../_shared/stats'

const MAX = 20
const START = [6, 7, 7, 8, 8, 8, 9, 9, 10, 12]

export default function DotPlotBalance() {
  const [data, setData] = useState<number[]>(START)
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const W = 560
  const X = (v: number) => 30 + (v / MAX) * (W - 60)
  const click = (e: MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const v = Math.round(((px - 30) / (W - 60)) * MAX)
    if (v < 0 || v > MAX) return
    if (mode === 'add') { if (data.length < 30) setData((d) => [...d, v]) }
    else setData((d) => { const i = d.indexOf(v); return i < 0 ? d : [...d.slice(0, i), ...d.slice(i + 1)] })
  }
  const has = data.length > 0
  const mn = has ? mean(data) : 0
  const md = has ? median(data) : 0
  const mo = has ? modes(data) : []
  const stacks = new Map<number, number>()
  return (
    <LabFrame labId="dot-plot-balance" title="Dot Plot Balance" subtitle="The mean is the balance point; the median is the middle. Watch what one extreme value does to each." howTo={<p>Tap the number line to add a dot (or switch to remove mode). The ▲ shows the mean, where the plot would balance. Try adding an outlier at 20.</p>}>
      <div className="flex flex-wrap gap-2">
        {(['add', 'remove'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn('rounded-lg border-2 px-3 py-1 text-sm', mode === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{m === 'add' ? '➕ Add dots' : '➖ Remove dots'}</button>)}
        <Button size="sm" variant="outline" onClick={() => setData((d) => [...d, 20])}>Add an outlier (20)</Button>
        <Button size="sm" variant="ghost" onClick={() => setData(START)}>Reset</Button>
      </div>
      <svg viewBox={`0 0 ${W} 230`} onClick={click} className="mt-3 w-full cursor-pointer touch-manipulation rounded-2xl border bg-background" role="img" aria-label={`Dot plot of ${data.length} values; mean ${mn.toFixed(2)}, median ${md}`}>
        <line x1={20} y1={170} x2={W - 20} y2={170} stroke="currentColor" strokeWidth={2} />
        {Array.from({ length: MAX + 1 }, (_, v) => <g key={v}><line x1={X(v)} y1={165} x2={X(v)} y2={175} stroke="currentColor" /><text x={X(v)} y={190} textAnchor="middle" fontSize={10} fill="currentColor">{v}</text></g>)}
        {[...data].sort((a, b) => a - b).map((v, i) => {
          const k = stacks.get(v) ?? 0
          stacks.set(v, k + 1)
          return <circle key={i} cx={X(v)} cy={158 - k * 13} r={5.5} fill={mo.includes(v) ? '#f59e0b' : '#6366f1'} />
        })}
        {has && (
          <>
            <polygon points={`${X(mn)},178 ${X(mn) - 9},200 ${X(mn) + 9},200`} fill="#10b981" />
            <text x={X(mn)} y={214} textAnchor="middle" fontSize={11} fontWeight={700} fill="#10b981">mean {Math.round(mn * 100) / 100}</text>
            <line x1={X(md)} y1={20} x2={X(md)} y2={170} stroke="#ec4899" strokeWidth={2} strokeDasharray="5 4" />
            <text x={X(md)} y={16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ec4899">median {md}</text>
          </>
        )}
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Readout label="Mean (balance point)" value={has ? `${Math.round(mn * 100) / 100}` : '—'} />
        <Readout label="Median (middle)" value={has ? `${md}` : '—'} />
        <Readout label="Mode (most common)" value={has ? (mo.length ? mo.join(', ') : 'none') : '—'} />
        <Readout label="Range (spread)" value={has ? `${range(data)}` : '—'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Mean = sum ÷ count = {data.reduce((a, b) => a + b, 0)} ÷ {data.length}. An <b>outlier</b> pulls the mean towards it but barely moves the median, so the median is often a fairer “typical” value when there are extreme values (like one very rich person in a village).</p>
    </LabFrame>
  )
}
