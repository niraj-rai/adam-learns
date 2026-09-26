import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { edges, PATTERNS, sticks } from './model'

export default function MatchstickPatterns() {
  const [pid, setPid] = useState(PATTERNS[0].id)
  const p = PATTERNS.find((x) => x.id === pid)!
  const [n, setN] = useState(3)
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [hint, setHint] = useState(false)
  const es = edges(pid, n)
  const xs = es.flatMap(([u, v]) => [u[0], v[0]])
  const ys = es.flatMap(([u, v]) => [u[1], v[1]])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const S = Math.min(60, 560 / Math.max(1, maxX - minX))
  const W = (maxX - minX) * S + 40
  const H = (maxY - minY) * S + 40
  const X = (x: number) => 20 + (x - minX) * S
  const Y = (y: number) => H - 20 - (y - minY) * S
  const table = [1, 2, 3, 4, 5]
  const ok = table.every((k) => a * k + b === sticks(p, k))
  const pick = (id: string) => { setPid(id); setA(1); setB(0); setHint(false) }
  return (
    <LabFrame labId="matchstick-patterns" title="Matchstick Patterns" subtitle="Find a rule with a letter-number that works for any size of pattern." howTo={<p>Pick a pattern and grow it. Fill in the table, then set a and b so that sticks = a × n + b works for every row. Once your rule works, it can predict any size instantly.</p>}>
      <div className="mb-3 flex flex-wrap gap-1">
        {PATTERNS.map((x) => (
          <button key={x.id} type="button" aria-pressed={pid === x.id} onClick={() => pick(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pid === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-background p-2">
        <svg viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: 220 }} className="mx-auto h-auto w-full" role="img" aria-label={`${p.name} with ${n} shapes uses ${es.length} matchsticks`}>
          {es.map(([u, v], i) => (
            <g key={i}>
              <line x1={X(u[0])} y1={Y(u[1])} x2={X(v[0])} y2={Y(v[1])} stroke="#b45309" strokeWidth={5} strokeLinecap="round" />
              <circle cx={X(v[0])} cy={Y(v[1])} r={3.5} fill="#dc2626" />
            </g>
          ))}
        </svg>
      </div>
      <label className="mt-3 block text-sm">Number of shapes n = <b>{n}</b>
        <Slider value={[n]} min={1} max={8} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Number of shapes" />
      </label>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <table className="rounded-xl border text-center text-sm">
          <thead><tr className="border-b"><th className="p-1.5">n</th>{table.map((k) => <th key={k} className="p-1.5">{k}</th>)}</tr></thead>
          <tbody>
            <tr className="border-b"><td className="p-1.5 font-semibold">Sticks</td>{table.map((k) => <td key={k} className="p-1.5 font-mono">{sticks(p, k)}</td>)}</tr>
            <tr><td className="p-1.5 font-semibold">Your rule</td>{table.map((k) => <td key={k} className={cn('p-1.5 font-mono', a * k + b === sticks(p, k) ? 'text-success' : 'text-destructive')}>{a * k + b}</td>)}</tr>
          </tbody>
        </table>
        <div className="space-y-2">
          <p className="font-mono text-lg">sticks = <b>{a}</b> × n + <b>{b}</b></p>
          <label className="block text-sm">a = {a}<Slider value={[a]} min={0} max={6} step={1} onValueChange={([v]) => { setA(v); if (v === p.a && b === p.b) sfx.correct() }} className="mt-1" aria-label="a" /></label>
          <label className="block text-sm">b = {b}<Slider value={[b]} min={0} max={6} step={1} onValueChange={([v]) => { setB(v); if (a === p.a && v === p.b) sfx.correct() }} className="mt-1" aria-label="b" /></label>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Sticks in the picture" value={`${es.length}`} />
        <Readout label="Your rule predicts for n = 100" value={ok ? `${a} × 100 + ${b} = ${a * 100 + b}` : 'Fix your rule first'} />
      </div>
      {ok ? (
        <p role="status" className="mt-3 rounded-xl bg-success-soft px-4 py-2 text-sm">✅ Your rule works! <b>{a}n + {b}</b> is an <b>algebraic expression</b>: n is a letter-number that can stand for any size. {p.hint}</p>
      ) : (
        <button type="button" onClick={() => setHint(true)} className="mt-3 text-sm text-chem underline">{hint ? p.hint : 'Need a hint?'}</button>
      )}
    </LabFrame>
  )
}
