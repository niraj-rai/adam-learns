import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { simulate, theory } from './model'

export default function DiceLab() {
  const [dice, setDice] = useState<1 | 2>(1)
  const [counts, setCounts] = useState<Map<number, number>>(new Map())
  const [last, setLast] = useState<number | null>(null)
  const total = [...counts.values()].reduce((a, b) => a + b, 0)
  const th = theory(6, dice)
  const keys = [...th.keys()].sort((a, b) => a - b)
  const roll = (n: number) => {
    const c = simulate(n, 6, dice, Math.floor(Math.random() * 1e9))
    setCounts((old) => {
      const next = new Map(old)
      for (const [k, v] of c) next.set(k, (next.get(k) ?? 0) + v)
      return next
    })
    if (n === 1) setLast([...c.keys()][0])
    else setLast(null)
    sfx.click()
  }
  const switchDice = (d: 1 | 2) => { setDice(d); setCounts(new Map()); setLast(null) }
  const maxP = Math.max(...keys.map((k) => Math.max(th.get(k)!, total ? (counts.get(k) ?? 0) / total : 0)))
  const W = 460
  const H = 220
  const bw = (W - 50) / keys.length
  const Y = (p: number) => H - 30 - (p / maxP) * (H - 60)
  const best = keys.reduce((a, k) => (th.get(k)! > th.get(a)! ? k : a), keys[0])
  return (
    <LabFrame labId="dice-lab" title="Dice Lab" subtitle="Roll dice thousands of times. Does experiment agree with theory?" howTo={<p>Roll one die or two dice (adding the scores). Bars show how often each result came up; the dashed marks show the theoretical probability. Roll more and watch them meet.</p>}>
      <div className="flex flex-wrap items-center gap-2">
        {([1, 2] as const).map((d) => <button key={d} type="button" aria-pressed={dice === d} onClick={() => switchDice(d)} className={cn('rounded-lg border-2 px-3 py-1 text-sm', dice === d ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{d === 1 ? '🎲 One die' : '🎲🎲 Two dice (sum)'}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[1, 10, 100, 1000].map((n) => <Button key={n} variant={n === 1 ? 'default' : 'outline'} onClick={() => roll(n)}>Roll {n === 1 ? 'once' : `×${n}`}</Button>)}
        <Button variant="ghost" onClick={() => { setCounts(new Map()); setLast(null) }}>Reset</Button>
        {last !== null && <span className="self-center text-lg font-bold">You rolled {last}</span>}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Results of ${total} rolls`}>
        <line x1={40} y1={H - 30} x2={W - 10} y2={H - 30} stroke="currentColor" />
        {keys.map((k, i) => {
          const p = total ? (counts.get(k) ?? 0) / total : 0
          const tp = th.get(k)!
          const x = 45 + i * bw
          return (
            <g key={k}>
              <rect x={x + bw * 0.15} y={Y(p)} width={bw * 0.7} height={H - 30 - Y(p)} fill="#6366f1" fillOpacity={0.65} />
              <line x1={x + bw * 0.05} y1={Y(tp)} x2={x + bw * 0.95} y2={Y(tp)} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 3" />
              <text x={x + bw / 2} y={H - 14} textAnchor="middle" fontSize={11} fill="currentColor">{k}</text>
            </g>
          )
        })}
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Total rolls" value={`${total.toLocaleString('en-IN')}`} />
        <Readout label={`Theory: P(${best})`} value={dice === 1 ? '1/6 ≈ 0.167' : '6/36 = 1/6 ≈ 0.167'} />
        <Readout label={`Experiment: ${best}s`} value={total ? `${counts.get(best) ?? 0}/${total} ≈ ${((counts.get(best) ?? 0) / total).toFixed(3)}` : '—'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{dice === 1 ? 'Each face has the same chance, 1/6. With a few rolls the bars are uneven; with thousands they level out. That is the law of large numbers.' : 'With two dice, 7 is most likely: 6 of the 36 equally likely pairs add to 7, but only one (1 + 1) makes 2. The bars build a triangle shape.'}</p>
    </LabFrame>
  )
}
