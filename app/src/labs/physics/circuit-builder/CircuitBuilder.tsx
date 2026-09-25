import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CircuitLoop } from './CircuitLoop'
import { evaluate, MATERIALS, type Part, REASON_TEXT, twoBulbs } from './model'

type Tab = 'build' | 'tester' | 'parallel'

export default function CircuitBuilder({ start }: { start?: Tab }) {
  const [tab, setTab] = useState<Tab>(start ?? 'build')
  return (
    <LabFrame labId="circuit-builder" title="Circuit Builder" subtitle="A circuit must be a complete loop, from one terminal of the cell, through the components, back to the other." howTo={<p>Build: tap a spot on the loop, then choose a part. Tap “Flip / toggle” to turn a cell or LED round or to open and close a switch. Tester: test everyday materials. Series vs parallel: compare two ways to connect two bulbs.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['build', '🔌 Build a circuit'], ['tester', '🧪 Conductor tester'], ['parallel', '💡💡 Series vs parallel']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'build' && <Build />}
      {tab === 'tester' && <Tester />}
      {tab === 'parallel' && <Parallel />}
    </LabFrame>
  )
}

const PALETTE: { label: string; part: Part }[] = [
  { label: '— Wire', part: { type: 'wire' } },
  { label: '🔋 Cell', part: { type: 'cell' } },
  { label: '💡 Bulb', part: { type: 'bulb' } },
  { label: '🔴 LED', part: { type: 'led' } },
  { label: '🔘 Switch', part: { type: 'switch', closed: false } },
]
const CHALLENGES = [
  { id: 'light', text: 'Make the bulb light up.', ok: (_: Part[], r: ReturnType<typeof evaluate>) => r.bulb > 0 },
  { id: 'bright', text: 'Make a bulb at least 3× brighter than normal.', ok: (_: Part[], r: ReturnType<typeof evaluate>) => r.bulb >= 3 },
  { id: 'led', text: 'Light an LED. (Careful: it has a right way round!)', ok: (_: Part[], r: ReturnType<typeof evaluate>) => r.ledOn },
  { id: 'switch', text: 'Build a working circuit with a switch, then use the switch to turn it off.', ok: () => false },
]

function Build() {
  const addXp = useProgress((s) => s.addXp)
  const [parts, setParts] = useState<Part[]>([{ type: 'cell' }, { type: 'switch', closed: false }, { type: 'bulb' }, { type: 'wire' }, { type: 'wire' }, { type: 'wire' }])
  const [sel, setSel] = useState<number | null>(1)
  const [done, setDone] = useState<string[]>([])
  const [hadSwitchOn, setHadSwitchOn] = useState(false)
  const r = evaluate(parts)

  const update = (next: Part[]) => {
    setParts(next)
    const res = evaluate(next)
    const newly: string[] = []
    for (const c of CHALLENGES) if (!done.includes(c.id) && c.ok(next, res)) newly.push(c.id)
    const hasSwitch = next.some((p) => p.type === 'switch')
    if (hasSwitch && res.reason === 'works') setHadSwitchOn(true)
    if (hadSwitchOn && hasSwitch && res.reason === 'open-switch' && !done.includes('switch')) newly.push('switch')
    if (newly.length) {
      setDone((d) => [...d, ...newly])
      addXp(5 * newly.length, 'Circuit challenge')
      sfx.correct()
    }
  }
  const place = (p: Part) => { if (sel !== null) update(parts.map((x, i) => (i === sel ? p : x))) }
  const flip = () => {
    if (sel === null) return
    const p = parts[sel]
    const q: Part = p.type === 'cell' ? { ...p, reversed: !p.reversed } : p.type === 'led' ? { ...p, reversed: !p.reversed } : p.type === 'switch' ? { ...p, closed: !p.closed } : p
    update(parts.map((x, i) => (i === sel ? q : x)))
  }
  const onSlot = (i: number) => {
    if (sel === i && ['cell', 'led', 'switch'].includes(parts[i].type)) flip()
    setSel(i)
  }

  return (
    <div className="space-y-3">
      <CircuitLoop parts={parts} result={r} selected={sel} onSlot={onSlot} label={`Circuit: ${REASON_TEXT[r.reason]}`} />
      <div className="flex flex-wrap gap-2">
        {PALETTE.map((p) => <Button key={p.label} size="sm" variant="outline" disabled={sel === null} onClick={() => place(p.part)}>{p.label}</Button>)}
        <Button size="sm" disabled={sel === null || !['cell', 'led', 'switch'].includes(parts[sel ?? 0]?.type)} onClick={flip}>🔄 Flip / toggle</Button>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <p role="status" className={cn('rounded-lg p-3 text-sm', r.reason === 'works' ? 'bg-success-soft' : 'bg-chem-soft')}>{r.reason === 'works' ? '✅ ' : '⭕ '}{REASON_TEXT[r.reason]}</p>
        <div className="space-y-2">
          <Readout label="Current" value={r.current ? `${(r.current * 1000).toFixed(0)} mA` : '0'} />
          <Readout label="Bulb brightness" value={r.bulb ? `× ${r.bulb.toFixed(1)}` : 'off'} />
        </div>
      </div>
      <div className="space-y-1.5">
        {CHALLENGES.map((c) => <p key={c.id} className={cn('rounded-lg border px-3 py-1.5 text-sm', done.includes(c.id) && 'border-success bg-success-soft')}>{done.includes(c.id) ? '✅' : '⬜'} {c.text}</p>)}
      </div>
    </div>
  )
}

function Tester() {
  const [mid, setMid] = useState<string | null>(null)
  const [tested, setTested] = useState<string[]>([])
  const parts: Part[] = [{ type: 'cell' }, { type: 'cell' }, { type: 'bulb' }, { type: 'wire' }, mid ? { type: 'material', id: mid } : { type: 'switch', closed: false }, { type: 'wire' }]
  const r = evaluate(parts)
  const m = MATERIALS.find((x) => x.id === mid)
  return (
    <div className="space-y-3">
      <p className="text-sm">Put a material between the two crocodile clips (bottom of the loop). Does the bulb glow?</p>
      <CircuitLoop parts={parts} result={r} label={m ? `Testing ${m.name}: ${m.conductor ? 'bulb glows' : 'bulb stays off'}` : 'Tester with a gap'} />
      <div className="flex flex-wrap gap-2">
        {MATERIALS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setMid(x.id); setTested((t) => (t.includes(x.id) ? t : [...t, x.id])) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === mid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {x.emoji} {x.name}{tested.includes(x.id) ? (x.conductor ? ' ✅' : ' ❌') : ''}
          </button>
        ))}
      </div>
      {m && (
        <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">
          {m.conductor ? `${m.name} is a conductor: the bulb glows${r.bulb < 2 ? ' (dimly: it conducts less well than a metal)' : ''}.` : `${m.name} is an insulator: no current flows, so the bulb stays off.`}
        </p>
      )}
      <Readout label="Materials tested" value={`${tested.length} / ${MATERIALS.length}`} />
      <p className="text-xs text-muted-foreground">⚠️ Safety: our bodies conduct electricity, especially with wet hands. Never touch mains wiring or sockets. The 230 V in our homes can kill; these experiments use only 1.5 V cells.</p>
    </div>
  )
}

function Parallel() {
  const [cells, setCells] = useState(1)
  const [removed, setRemoved] = useState(false)
  const s = twoBulbs('series', cells, removed)
  const p = twoBulbs('parallel', cells, removed)
  const Bulb = ({ b, x, y, gone }: { b: number; x: number; y: number; gone?: boolean }) => (
    <g transform={`translate(${x} ${y})`}>
      {gone ? <text y={4} fontSize={10} textAnchor="middle" className="fill-muted-foreground">removed</text> : (
        <>
          {b > 0 && <circle r={10 + Math.min(1, b) * 12} fill="#fde047" opacity={0.2 + Math.min(1, b) * 0.4} />}
          <circle r={11} fill={b > 0 ? '#fef08a' : 'var(--card)'} stroke="currentColor" strokeWidth={2} />
          <path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="currentColor" />
        </>
      )}
    </g>
  )
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border p-2">
          <p className="text-center text-sm font-semibold">Series (one path)</p>
          <svg viewBox="0 0 200 120" className="w-full text-foreground" role="img" aria-label={`Series: bulbs at ${s[0].toFixed(2)} brightness`}>
            <rect x={30} y={20} width={140} height={80} fill="none" stroke="currentColor" strokeWidth={2} />
            <Bulb b={s[0]} x={80} y={20} gone={removed} />
            <Bulb b={s[1]} x={120} y={20} />
            <text x={100} y={112} fontSize={10} textAnchor="middle" className="fill-foreground">{cells} cell{cells > 1 ? 's' : ''}</text>
          </svg>
        </div>
        <div className="rounded-2xl border p-2">
          <p className="text-center text-sm font-semibold">Parallel (two paths)</p>
          <svg viewBox="0 0 200 120" className="w-full text-foreground" role="img" aria-label={`Parallel: bulbs at ${p[1].toFixed(2)} brightness`}>
            <rect x={30} y={20} width={140} height={80} fill="none" stroke="currentColor" strokeWidth={2} />
            <line x1={30} y1={60} x2={170} y2={60} stroke="currentColor" strokeWidth={2} />
            <Bulb b={p[0]} x={100} y={20} gone={removed} />
            <Bulb b={p[1]} x={100} y={60} />
            <text x={100} y={112} fontSize={10} textAnchor="middle" className="fill-foreground">{cells} cell{cells > 1 ? 's' : ''}</text>
          </svg>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setCells((c) => (c === 1 ? 2 : 1))}>🔋 Use {cells === 1 ? 'two cells' : 'one cell'}</Button>
        <Button size="sm" variant={removed ? 'default' : 'outline'} onClick={() => setRemoved((x) => !x)}>{removed ? 'Put the bulb back' : 'Unscrew one bulb'}</Button>
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {removed ? 'In series, removing one bulb breaks the only path, so the other goes out too. In parallel, the other bulb has its own path and stays lit. That’s why homes are wired in parallel!' : 'In series, the bulbs share the push from the cell, so each is dimmer. In parallel, each bulb gets the full push and glows as brightly as a single bulb.'}
      </p>
    </div>
  )
}
