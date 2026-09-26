import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { expression, fmt, hop, positions, STORIES, type Op, type Step } from './model'

export default function NumberLineExplorer() {
  const [tab, setTab] = useState<'explore' | 'stories'>('explore')
  return (
    <LabFrame labId="number-line-explorer" title="Number Line Explorer" subtitle="Hop left and right across zero. What does subtracting a negative really do?" howTo={<p>Explore: pick a start, choose + or −, pick a number (it can be negative!) and press Hop. Stories: solve real problems, then see the hops.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['explore', '🦘 Explore'], ['stories', '📖 Stories']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'explore' ? <Explore /> : <Stories />}
    </LabFrame>
  )
}

function NumberLine({ start, steps }: { start: number; steps: Step[] }) {
  const pos = positions(start, steps)
  const lo = Math.min(-10, ...pos.map((p) => p - 2))
  const hi = Math.max(10, ...pos.map((p) => p + 2))
  const W = 640
  const x = (v: number) => 20 + ((v - lo) / (hi - lo)) * (W - 40)
  const tickEvery = hi - lo > 40 ? 5 : hi - lo > 24 ? 2 : 1
  const ticks = []
  for (let v = Math.ceil(lo); v <= hi; v++) ticks.push(v)
  return (
    <svg viewBox={`0 0 ${W} 150`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Number line: ${expression(start, steps)} = ${pos.at(-1)}`}>
      <line x1={10} y1={75} x2={W - 10} y2={75} stroke="currentColor" strokeWidth={2} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={v === 0 ? 65 : 70} x2={x(v)} y2={v === 0 ? 85 : 80} stroke="currentColor" strokeWidth={v === 0 ? 2.5 : 1} />
          {v % tickEvery === 0 && <text x={x(v)} y={100} textAnchor="middle" fontSize={11} fill="currentColor" fontWeight={v === 0 ? 700 : 400}>{v < 0 ? `−${-v}` : v}</text>}
        </g>
      ))}
      {steps.map((s, i) => {
        const a = pos[i]
        const b = pos[i + 1]
        if (a === b) return null
        const right = b > a
        const y = right ? 75 - 18 - Math.min(40, Math.abs(b - a) * 3) : 75 + 18 + Math.min(40, Math.abs(b - a) * 3)
        const mid = (x(a) + x(b)) / 2
        return (
          <g key={i}>
            <path d={`M${x(a)},75 Q${mid},${right ? y - 10 : y + 10} ${x(b)},75`} fill="none" stroke={right ? '#16a34a' : '#ea580c'} strokeWidth={2.5} markerEnd={`url(#arr-${right ? 'r' : 'l'})`} />
            <text x={mid} y={right ? y - 2 : y + 12} textAnchor="middle" fontSize={11} fontWeight={600} fill={right ? '#16a34a' : '#ea580c'}>{s.op === '+' ? '+' : '−'} {fmt(s.n)}</text>
          </g>
        )
      })}
      <defs>
        <marker id="arr-r" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#16a34a" /></marker>
        <marker id="arr-l" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#ea580c" /></marker>
      </defs>
      <circle cx={x(start)} cy={75} r={6} fill="#6366f1" />
      <text x={x(pos.at(-1)!)} y={60} textAnchor="middle" fontSize={20}>🦘</text>
    </svg>
  )
}

function Explore() {
  const [start, setStart] = useState(-3)
  const [op, setOp] = useState<Op>('-')
  const [n, setN] = useState(-4)
  const [steps, setSteps] = useState<Step[]>([])
  const end = positions(start, steps).at(-1)!
  const last = steps.at(-1)
  return (
    <div className="space-y-3">
      <NumberLine start={start} steps={steps} />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Start at <b>{start < 0 ? `−${-start}` : start}</b>
          <Slider value={[start]} min={-10} max={10} step={1} onValueChange={([v]) => { setStart(v); setSteps([]) }} className="mt-1.5" aria-label="Start" />
        </label>
        <div className="text-sm">Operation
          <div className="mt-1 flex gap-1">
            {(['+', '-'] as const).map((o) => (
              <button key={o} type="button" aria-pressed={op === o} onClick={() => setOp(o)} className={cn('flex-1 rounded-lg border-2 py-1 font-semibold', op === o ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{o === '+' ? 'Add +' : 'Subtract −'}</button>
            ))}
          </div>
        </div>
        <label className="text-sm">Number <b>{fmt(n)}</b>
          <Slider value={[n]} min={-10} max={10} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Number" />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { if (steps.length < 6 && n !== 0) { setSteps((s) => [...s, { op, n }]); sfx.click() } }} disabled={steps.length >= 6 || n === 0}>🦘 Hop</Button>
        <Button variant="outline" onClick={() => setSteps([])}>Clear hops</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="Calculation" value={steps.length ? expression(start, steps) : '—'} />
        <Readout label="Answer" value={end < 0 ? `−${-end}` : `${end}`} />
      </div>
      {last && (
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
          {last.op === '-' && last.n < 0
            ? <>Subtracting <b>{fmt(last.n)}</b> moved you <b>right</b> by {-last.n}: taking away a debt is like gaining money. So <b>a − ({`−${-last.n}`}) = a + {-last.n}</b>.</>
            : <>{last.op === '+' ? 'Adding' : 'Subtracting'} <b>{fmt(last.n)}</b> moved you <b>{hop(last) > 0 ? 'right' : 'left'}</b> by {Math.abs(last.n)}.{last.op === '+' && last.n < 0 && <> Adding a negative is the same as subtracting: a + (−{-last.n}) = a − {-last.n}.</>}</>}
        </p>
      )}
    </div>
  )
}

function parse(s: string) {
  const v = Number(s.replace(/[−–]/g, '-').replace(/\s/g, ''))
  return s.trim() === '' || Number.isNaN(v) ? null : v
}

function Stories() {
  const [i, setI] = useState(0)
  const [ans, setAns] = useState('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const [score, setScore] = useState<Record<number, boolean>>({})
  const s = STORIES[i]
  const correct = positions(s.start, s.steps).at(-1)!
  const check = () => {
    const v = parse(ans)
    if (v === null) return
    const ok = v === correct
    setChecked(ok)
    if (!(i in score)) setScore((sc) => ({ ...sc, [i]: ok }))
    if (ok) sfx.correct()
    else sfx.wrong()
  }
  const go = (d: number) => { setI((i + d + STORIES.length) % STORIES.length); setAns(''); setChecked(null) }
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
        <span className="text-4xl" aria-hidden>{s.emoji}</span>
        <p className="text-[15px]">{s.text}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={ans} onChange={(e) => { setAns(e.target.value); setChecked(null) }} onKeyDown={(e) => e.key === 'Enter' && check()} placeholder="Your answer" aria-label="Your answer" className="w-36 rounded-lg border-2 bg-background px-3 py-1.5" />
        <span className="text-sm text-muted-foreground">{s.unit}</span>
        <Button onClick={check}>Check</Button>
        <span className="ml-auto text-sm text-muted-foreground">Story {i + 1} / {STORIES.length} · ✅ {Object.values(score).filter(Boolean).length} right first time</span>
      </div>
      {checked !== null && (
        <div role="status" className={cn('rounded-xl p-3 text-sm', checked ? 'bg-success-soft' : 'bg-warn-soft')}>
          {checked ? '✅ Correct! ' : '❌ Not quite. Follow the hops: '}
          <b>{expression(s.start, s.steps)} = {correct < 0 ? `−${-correct}` : correct}</b>
        </div>
      )}
      {checked !== null && <NumberLine start={s.start} steps={s.steps} />}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => go(-1)}>← Previous</Button>
        <Button variant="outline" onClick={() => go(1)}>Next story →</Button>
      </div>
    </div>
  )
}
