import { motion } from 'motion/react'
import { Minus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { shells } from '../../_kit/elements'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CHALLENGES, describe, matches, type Atom } from './model'

const LIMITS = { p: 20, n: 24, e: 22 }

export function BohrDiagram({ p, n, e, size = 260 }: Atom & { size?: number }) {
  const sh = shells(Math.min(e, 20))
  const extra = Math.max(0, e - 20)
  const c = size / 2
  const nucleus = useMemo(() => {
    // alternate protons and neutrons in a sunflower spiral so both are visible
    const parts: { x: number; y: number; t: 'p' | 'n' }[] = []
    let pc = 0
    let nc = 0
    for (let i = 0; i < p + n; i++) {
      const t: 'p' | 'n' = pc < p && (i % 2 === 0 || nc >= n) ? 'p' : 'n'
      if (t === 'p') pc++
      else nc++
      const r = 3.2 * Math.sqrt(i)
      const a = i * 2.4
      parts.push({ x: c + r * Math.cos(a), y: c + r * Math.sin(a), t })
    }
    return parts
  }, [p, n, c])
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label={`Atom with ${p} protons, ${n} neutrons and ${e} electrons in shells ${sh.join(', ')}`}>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={c} cy={c} r={34 + i * 26} fill="none" stroke="currentColor" strokeOpacity={i < sh.length ? 0.35 : 0.1} strokeDasharray={i < sh.length ? undefined : '3 4'} />
      ))}
      {nucleus.map((q, i) => (
        <circle key={i} cx={q.x} cy={q.y} r={4.2} fill={q.t === 'p' ? '#ef4444' : '#94a3b8'} stroke="rgba(0,0,0,.3)" strokeWidth={0.6} />
      ))}
      {sh.map((count, si) =>
        Array.from({ length: count }, (_, k) => {
          const r = 34 + si * 26
          const a = (k / count) * Math.PI * 2 - Math.PI / 2
          return <motion.circle key={`${si}-${k}`} initial={{ scale: 0 }} animate={{ scale: 1 }} cx={c + r * Math.cos(a)} cy={c + r * Math.sin(a)} r={4.5} fill="#2563eb" stroke="#fff" strokeWidth={1} />
        }),
      )}
      {extra > 0 && <text x={size - 10} y={16} textAnchor="end" fontSize={11} fill="#dc2626">+{extra} extra e⁻</text>}
    </svg>
  )
}

function Counter({ label, colour, value, onChange, max }: { label: string; colour: string; value: number; onChange: (v: number) => void; max: number }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
      <span className="size-4 rounded-full border border-black/30" style={{ background: colour }} />
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <Button size="icon-sm" variant="outline" onClick={() => onChange(Math.max(0, value - 1))} aria-label={`Remove a ${label.toLowerCase().slice(0, -1)}`} disabled={value === 0}>
        <Minus />
      </Button>
      <span className="w-6 text-center font-heading text-lg tabular-nums">{value}</span>
      <Button size="icon-sm" variant="outline" onClick={() => onChange(Math.min(max, value + 1))} aria-label={`Add a ${label.toLowerCase().slice(0, -1)}`} disabled={value >= max}>
        <Plus />
      </Button>
    </div>
  )
}

export default function AtomBuilder({ set = 'basic' }: { set?: 'basic' | 'isotopes' }) {
  const challenges = CHALLENGES.filter((c) => c.set === set)
  const [atom, setAtom] = useState<{ p: number; n: number; e: number }>({ p: 0, n: 0, e: 0 })
  const [ci, setCi] = useState(0)
  const [solved, setSolved] = useState<string[]>([])
  const info = describe(atom)
  const ch = challenges[ci]
  const done = ch && matches(atom, ch.target)

  useEffect(() => {
    if (ch && done && !solved.includes(ch.id)) {
      setSolved((s) => [...s, ch.id])
      sfx.win()
    }
  }, [done, ch, solved])

  return (
    <LabFrame
      labId="atom-builder"
      title="Atom Builder"
      subtitle="Add protons, neutrons and electrons. Which element have you made?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>The number of <b>protons</b> decides which element it is.</li>
          <li><b>Protons + neutrons</b> = mass number. <b>Protons − electrons</b> = charge.</li>
          <li>Electrons fill shells from the inside out: 2, then 8, then 8.</li>
        </ul>
      }
    >
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <div className="mx-auto aspect-square w-full max-w-[320px] rounded-2xl border bg-background p-2">
          <BohrDiagram {...atom} />
        </div>
        <div className="space-y-2">
          <Counter label="Protons" colour="#ef4444" value={atom.p} max={LIMITS.p} onChange={(v) => setAtom((a) => ({ ...a, p: v }))} />
          <Counter label="Neutrons" colour="#94a3b8" value={atom.n} max={LIMITS.n} onChange={(v) => setAtom((a) => ({ ...a, n: v }))} />
          <Counter label="Electrons" colour="#2563eb" value={atom.e} max={LIMITS.e} onChange={(v) => setAtom((a) => ({ ...a, e: v }))} />
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Element" value={info.el ? `${info.el.name} (${info.el.symbol})` : atom.p === 0 ? 'none' : '—'} />
            <Readout label="Mass number" value={info.massNumber} />
            <Readout label="Charge" value={info.charge === 0 ? '0' : info.charge > 0 ? `+${info.charge}` : `${info.charge}`} />
            <Readout label="Shells" value={shells(Math.min(atom.e, 20)).join(', ') || '—'} />
          </div>
          {info.el && (
            <p className="rounded-lg bg-chem-soft px-3 py-2 text-sm">
              <b>{info.el.name}-{info.massNumber}</b>: a {info.chargeLabel}, {info.isotopeNote}.
            </p>
          )}
        </div>
      </div>

      {ch && (
        <div className={cn('mt-4 rounded-2xl border p-4', done ? 'border-success/50 bg-success-soft' : 'bg-muted/40')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              🎯 Challenge {ci + 1} / {challenges.length}: build <b>{ch.title}</b>
            </p>
            <span className="text-xs text-muted-foreground">Solved {solved.filter((s) => challenges.some((c) => c.id === s)).length} / {challenges.length}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">💡 {ch.hint}</p>
          {done && <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-2 text-sm font-semibold text-success" role="status">✅ Perfect!</motion.p>}
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" disabled={ci === 0} onClick={() => setCi((i) => i - 1)}>← Previous</Button>
            <Button size="sm" variant={done ? 'default' : 'outline'} disabled={ci === challenges.length - 1} onClick={() => setCi((i) => i + 1)}>Next challenge →</Button>
          </div>
        </div>
      )}
    </LabFrame>
  )
}
