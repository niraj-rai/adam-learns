import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { ELEMENTS, shells } from '../../_kit/elements'
import { LabFrame } from '../../_kit/LabFrame'

const CAPS = [2, 8, 8, 2]
const R = [34, 60, 86, 112]

export default function ShellBuilder() {
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(ELEMENTS.slice(2)).slice(0, 8), [round])
  const [i, setI] = useState(0)
  const [filled, setFilled] = useState<number[]>([0, 0, 0, 0])
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)
  const [score, setScore] = useState(0)
  const el = order[i]
  const done = i >= order.length
  const target = el ? shells(el.z) : []
  const total = filled.reduce((a, b) => a + b, 0)

  const add = (s: number, d: number) => {
    if (result) return
    setFilled((f) => f.map((v, k) => (k === s ? Math.max(0, Math.min(CAPS[k], v + d)) : v)))
  }
  const check = () => {
    const ok = target.every((v, k) => filled[k] === v) && filled.slice(target.length).every((v) => v === 0)
    setResult(ok ? 'right' : 'wrong')
    if (ok) {
      setScore((s) => s + 1)
      sfx.correct()
    } else sfx.wrong()
  }
  const next = () => {
    setI((x) => x + 1)
    setFilled([0, 0, 0, 0])
    setResult(null)
  }

  return (
    <LabFrame
      labId="shell-builder"
      title="Shell Builder"
      subtitle="Put each atom's electrons into the right shells"
      howTo={<p>The first shell holds up to 2 electrons, the second up to 8, the third up to 8 (for the first 20 elements). Fill from the inside out. Tap + and − on each shell.</p>}
    >
      {done ? (
        <div className="rounded-2xl border bg-chem-soft p-6 text-center">
          <p className="text-5xl">{score >= 7 ? '🏆' : '⚛️'}</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{score} / {order.length} correct</p>
          <p className="mt-1 text-sm text-muted-foreground">Rule: 2, then 8, then 8. The electrons in the OUTER shell decide how an element reacts.</p>
          <Button className="mt-3" onClick={() => { setRound((r) => r + 1); setI(0); setScore(0); setFilled([0, 0, 0, 0]); setResult(null) }}>New elements</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[300px] rounded-2xl border bg-background" role="img" aria-label={`Shells: ${filled.join(', ')}`}>
            <circle cx={130} cy={130} r={14} fill="#ef4444" />
            <text x={130} y={134} textAnchor="middle" fontSize={10} fill="#fff" fontWeight={700}>{el.z}+</text>
            {R.map((r, s) => (
              <g key={s}>
                <circle cx={130} cy={130} r={r} fill="none" stroke="currentColor" strokeOpacity={0.3} />
                {Array.from({ length: filled[s] }, (_, k) => {
                  const a = (k / Math.max(1, filled[s])) * Math.PI * 2 - Math.PI / 2
                  return <motion.circle key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} cx={130 + r * Math.cos(a)} cy={130 + r * Math.sin(a)} r={5} fill="#2563eb" stroke="#fff" />
                })}
              </g>
            ))}
          </svg>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Element {i + 1} of {order.length} · Score {score}</p>
            <p className="font-heading text-2xl font-semibold">{el.name} <span className="text-muted-foreground">({el.symbol})</span></p>
            <p className="text-sm">Atomic number <b>{el.z}</b>, so it has <b>{el.z} electrons</b>. Placed: <b className={cn(total === el.z ? 'text-success' : total > el.z ? 'text-destructive' : '')}>{total}</b></p>
            {CAPS.map((cap, s) => (
              <div key={s} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 text-sm">
                <span className="flex-1">Shell {s + 1} <span className="text-muted-foreground">(max {cap})</span></span>
                <Button size="icon-sm" variant="outline" onClick={() => add(s, -1)} aria-label={`Remove electron from shell ${s + 1}`}>−</Button>
                <span className="w-5 text-center tabular-nums">{filled[s]}</span>
                <Button size="icon-sm" variant="outline" onClick={() => add(s, 1)} aria-label={`Add electron to shell ${s + 1}`}>+</Button>
              </div>
            ))}
            {!result ? (
              <Button className="w-full" onClick={check} disabled={total === 0}>Check</Button>
            ) : (
              <div role="status" className={cn('rounded-lg p-3 text-sm', result === 'right' ? 'bg-success-soft' : 'bg-warn-soft')}>
                {result === 'right' ? '✅ Correct! ' : `❌ It should be ${target.join(', ')}. `}
                {el.name} has <b>{target[target.length - 1]}</b> electron{target[target.length - 1] === 1 ? '' : 's'} in its outer shell and is in <b>group {el.group}</b>, period <b>{el.period}</b> (it has {target.length} shell{target.length > 1 ? 's' : ''}).
                <Button size="sm" className="mt-2 w-full" onClick={next}>Next element →</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </LabFrame>
  )
}
