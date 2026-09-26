import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { STORIES } from './model'

export default function GraphStories() {
  const [i, setI] = useState(0)
  const s = STORIES[i]
  const opts = useMemo(() => shuffle(s.options.map((o, k) => ({ o, ok: k === s.answer }))), [s])
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const W = 420
  const H = 240
  const xMax = Math.max(...s.pts.map((p) => p[0]))
  const yMax = Math.max(...s.pts.map((p) => p[1])) * 1.1
  const X = (v: number) => 40 + (v / xMax) * (W - 60)
  const Y = (v: number) => H - 30 - (v / yMax) * (H - 50)
  const ok = picked !== null && opts.find((x) => x.o === picked)?.ok
  const pick = (o: string, good: boolean) => {
    if (picked) return
    setPicked(o)
    if (good) { sfx.correct(); setScore((v) => v + 1) } else sfx.wrong()
  }
  return (
    <LabFrame labId="graph-stories" title="Graph Stories" subtitle="Every graph tells a story. Can you read it?" howTo={<p>Look carefully at the graph: where does it rise, stay flat, fall, jump, curve? Pick the story that matches.</p>}>
      <p className="font-heading text-lg font-semibold">{s.title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full max-w-lg rounded-2xl border bg-background" role="img" aria-label={`Graph of ${s.y} against ${s.x}`}>
        <line x1={40} y1={H - 30} x2={W - 15} y2={H - 30} stroke="currentColor" strokeWidth={1.5} />
        <line x1={40} y1={H - 30} x2={40} y2={15} stroke="currentColor" strokeWidth={1.5} />
        <text x={W - 15} y={H - 10} textAnchor="end" fontSize={11} fill="currentColor">{s.x} →</text>
        <text x={45} y={14} fontSize={11} fill="currentColor">↑ {s.y}</text>
        <polyline points={s.pts.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth={3} strokeLinejoin="round" />
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {opts.map(({ o, ok: good }) => (
          <button key={o} type="button" disabled={Boolean(picked)} onClick={() => pick(o, good)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', picked && good && 'border-success bg-success-soft', picked === o && !good && 'border-destructive/60 bg-destructive/10', picked && picked !== o && !good && 'opacity-50')}>{o}</button>
        ))}
      </div>
      {picked && <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', ok ? 'bg-success-soft' : 'bg-warn-soft')}>{ok ? '✅ ' : '❌ '}{s.why}</p>}
      <div className="mt-3 flex items-center justify-between">
        <Button variant="outline" onClick={() => { setI((i + 1) % STORIES.length); setPicked(null) }}>Next graph →</Button>
        <span className="text-sm text-muted-foreground">Graph {i + 1} / {STORIES.length} · ✅ {score}</span>
      </div>
    </LabFrame>
  )
}
