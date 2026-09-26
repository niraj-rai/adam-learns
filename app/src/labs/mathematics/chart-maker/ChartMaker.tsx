import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { DATASETS, pieAngles } from './model'

const COLS = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#0ea5e9', '#a855f7']
type Kind = 'bar' | 'pie' | 'line'

export default function ChartMaker() {
  const [di, setDi] = useState(1)
  const [kind, setKind] = useState<Kind>('bar')
  const [trick, setTrick] = useState(false)
  const d = DATASETS[di]
  const vals = d.items.map((i) => i.v)
  const total = vals.reduce((a, b) => a + b, 0)
  const angles = pieAngles(vals)
  const max = Math.max(...vals)
  const lo = trick ? Math.min(...vals) * 0.9 : 0
  const W = 420
  const H = 240
  const Y = (v: number) => H - 30 - ((v - lo) / (max - lo)) * (H - 60)
  const bw = (W - 60) / vals.length
  let start = -90
  return (
    <LabFrame labId="chart-maker" title="Chart Maker" subtitle="The same data as a bar chart, a pie chart or a line graph. Which tells the story best?" howTo={<p>Pick a data set and a chart type. For pie charts, see how each angle is worked out. Then try the ‘cut the axis’ trick to see how graphs can mislead.</p>}>
      <div className="flex flex-wrap gap-1">
        {DATASETS.map((x, i) => <button key={x.id} type="button" aria-pressed={di === i} onClick={() => setDi(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', di === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.title}</button>)}
      </div>
      <div className="mt-2 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {(['bar', 'pie', 'line'] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={cn('rounded-md px-3 py-1 capitalize', kind === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{k === 'bar' ? '📊 Bar' : k === 'pie' ? '🥧 Pie' : '📈 Line'}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`${kind} chart of ${d.title}`}>
        {kind === 'pie' ? (
          <g>
            {vals.map((_, i) => {
              const a0 = (start * Math.PI) / 180
              const a1 = ((start + angles[i]) * Math.PI) / 180
              const mid = (a0 + a1) / 2
              start += angles[i]
              const r = 95
              const cx = 140
              const cy = 120
              return (
                <g key={i}>
                  <path d={`M${cx},${cy} L${cx + r * Math.cos(a0)},${cy + r * Math.sin(a0)} A${r},${r} 0 ${angles[i] > 180 ? 1 : 0} 1 ${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} Z`} fill={COLS[i % COLS.length]} stroke="white" />
                  <text x={cx + r * 0.65 * Math.cos(mid)} y={cy + r * 0.65 * Math.sin(mid) + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="white">{Math.round(angles[i])}°</text>
                </g>
              )
            })}
            {d.items.map((it, i) => <g key={it.l}><rect x={270} y={40 + i * 24} width={14} height={14} fill={COLS[i % COLS.length]} /><text x={290} y={52 + i * 24} fontSize={12} fill="currentColor">{it.l} ({it.v})</text></g>)}
          </g>
        ) : (
          <g>
            <line x1={40} y1={H - 30} x2={W - 10} y2={H - 30} stroke="currentColor" />
            <line x1={40} y1={20} x2={40} y2={H - 30} stroke="currentColor" />
            {[lo, (lo + max) / 2, max].map((v, i) => <text key={i} x={35} y={Y(v) + 4} textAnchor="end" fontSize={10} fill="currentColor">{Math.round(v)}</text>)}
            {trick && <text x={44} y={H - 34} fontSize={10} fill="#ef4444">axis starts at {Math.round(lo)}!</text>}
            {kind === 'bar'
              ? vals.map((v, i) => <rect key={i} x={45 + i * bw + bw * 0.15} y={Y(v)} width={bw * 0.7} height={H - 30 - Y(v)} fill={COLS[i % COLS.length]} />)
              : <polyline points={vals.map((v, i) => `${45 + i * bw + bw / 2},${Y(v)}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth={3} />}
            {kind === 'line' && vals.map((v, i) => <circle key={i} cx={45 + i * bw + bw / 2} cy={Y(v)} r={4} fill="#6366f1" />)}
            {d.items.map((it, i) => <text key={it.l} x={45 + i * bw + bw / 2} y={H - 14} textAnchor="middle" fontSize={10} fill="currentColor">{it.l}</text>)}
          </g>
        )}
      </svg>
      {kind !== 'pie' && <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={trick} onChange={(e) => setTrick(e.target.checked)} className="size-4" /> Cut the axis (don't start at 0)</label>}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Total" value={`${total} ${d.unit}`} />
        <Readout label={kind === 'pie' ? `Angle for ${d.items[0].l}` : 'Largest'} value={kind === 'pie' ? `${d.items[0].v}/${total} × 360° = ${Math.round(angles[0] * 10) / 10}°` : `${d.items[vals.indexOf(max)].l}: ${max} ${d.unit}`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {kind === 'pie' && 'Pie charts show parts of a whole: each angle = (value ÷ total) × 360°. They work best with a few categories that make up a total, like a whole day.'}
        {kind === 'bar' && (trick ? 'Starting the axis above 0 makes small differences look huge. Always check where the axis starts!' : 'Bar charts compare separate categories. The bars have gaps because the categories are separate.')}
        {kind === 'line' && (trick ? 'A cut axis makes the ups and downs look more dramatic than they really are.' : 'Line graphs show how something changes over time, like rainfall month by month. Joining categories like sports with a line would make no sense!')}
      </p>
    </LabFrame>
  )
}
