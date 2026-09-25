import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { BLOOD, cardiacOutput, correctLoop, PATH } from './model'

export default function HeartPump() {
  const [tab, setTab] = useState<'path' | 'pulse' | 'blood'>('path')
  return (
    <LabFrame labId="heart-pump" title="Heart Pump" subtitle="Your heart beats about 100,000 times a day, pushing blood around two loops: to the lungs and to the body." howTo={<p>Tab 1: put the stops of the blood's journey in order. Tab 2: see how heart rate changes how much blood is pumped. Tab 3: find out what blood is made of.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['path', '🔁 The journey'], ['pulse', '💓 Pulse and output'], ['blood', '🩸 What’s in blood?']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'path' && <Journey />}
      {tab === 'pulse' && <Pulse />}
      {tab === 'blood' && <Blood />}
    </LabFrame>
  )
}

function HeartDiagram({ active }: { active: string | null }) {
  const hi = (id: string) => (active === id ? 1 : 0.55)
  return (
    <svg viewBox="0 0 240 230" className="w-full max-w-sm" role="img" aria-label="Heart with four chambers; blue deoxygenated blood on the right side, red oxygenated blood on the left">
      <text x={120} y={14} textAnchor="middle" fontSize={10} className="fill-muted-foreground">(as if facing the person: their right is on your left)</text>
      <rect x={60} y={24} width={120} height={30} rx={12} fill="#fda4af" opacity={hi('lungs')} />
      <text x={120} y={44} textAnchor="middle" fontSize={11}>Lungs</text>
      <rect x={40} y={70} width={70} height={50} rx={10} fill="#60a5fa" opacity={hi('ra')} /><text x={75} y={99} textAnchor="middle" fontSize={10} fill="#fff">R atrium</text>
      <rect x={40} y={125} width={70} height={60} rx={10} fill="#3b82f6" opacity={hi('rv')} /><text x={75} y={159} textAnchor="middle" fontSize={10} fill="#fff">R ventricle</text>
      <rect x={130} y={70} width={70} height={50} rx={10} fill="#f87171" opacity={hi('la')} /><text x={165} y={99} textAnchor="middle" fontSize={10} fill="#fff">L atrium</text>
      <rect x={130} y={125} width={70} height={60} rx={10} fill="#ef4444" opacity={hi('lv')} /><text x={165} y={159} textAnchor="middle" fontSize={10} fill="#fff">L ventricle</text>
      <rect x={60} y={195} width={120} height={28} rx={12} fill="#c4b5fd" opacity={hi('body')} />
      <text x={120} y={213} textAnchor="middle" fontSize={11}>Body</text>
    </svg>
  )
}

function Journey() {
  const addXp = useProgress((s) => s.addXp)
  const shuffled = useMemo(() => shuffle(PATH.map((p) => p.id as string)), [])
  const [order, setOrder] = useState<string[]>([])
  const [result, setResult] = useState<null | boolean>(null)
  const name = (id: string) => PATH.find((p) => p.id === id)!.name
  const add = (id: string) => { if (!order.includes(id)) { setOrder((o) => [...o, id]); setResult(null) } }
  const check = () => {
    const ok = correctLoop(order)
    setResult(ok)
    if (ok) { sfx.win(); addXp(10, 'Traced the circulation') } else sfx.wrong()
  }
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <div className="grid place-items-center rounded-2xl border bg-background p-2"><HeartDiagram active={order[order.length - 1] ?? null} /></div>
      <div className="space-y-2">
        <p className="text-sm">Start at the body and tap the stops in the order blood visits them:</p>
        <div className="flex flex-wrap gap-1.5">
          {shuffled.filter((id) => !order.includes(id)).map((id) => <button key={id} type="button" onClick={() => add(id)} className="rounded-full border px-3 py-1 text-sm hover:bg-muted">{name(id)}</button>)}
        </div>
        <ol className="space-y-1 text-sm">
          {order.map((id, i) => <li key={id} className={cn('rounded-md px-2 py-0.5', PATH.find((p) => p.id === id)!.oxygenated ? 'bg-red-100 dark:bg-red-950' : 'bg-blue-100 dark:bg-blue-950')}>{i + 1}. {name(id)}</li>)}
        </ol>
        <div className="flex gap-2">
          <Button size="sm" onClick={check} disabled={order.length !== PATH.length}>Check the loop</Button>
          <Button size="sm" variant="ghost" onClick={() => { setOrder([]); setResult(null) }}>↺ Reset</Button>
        </div>
        {result !== null && <p role="status" className={cn('rounded-lg p-2 text-sm', result ? 'bg-success-soft' : 'bg-warn-soft')}>{result ? '✅ Correct! Blood goes through the heart TWICE per trip: the right side pumps it to the lungs to collect oxygen, and the left side pumps it to the body. This is double circulation.' : '❌ Not quite. Hint: blood from the body enters the right atrium; blood from the lungs enters the left atrium.'}</p>}
      </div>
    </div>
  )
}

function Pulse() {
  const [bpm, setBpm] = useState(72)
  return (
    <div className="space-y-3">
      <div className="grid place-items-center rounded-2xl border bg-background p-6">
        <motion.span key={bpm} className="text-7xl" animate={{ scale: [1, 1.25, 1] }} transition={{ repeat: Infinity, duration: 60 / bpm }}>❤️</motion.span>
      </div>
      <label className="block text-sm">Heart rate: <b>{bpm} beats per minute</b>
        <Slider value={[bpm]} min={50} max={190} step={2} onValueChange={([v]) => setBpm(v)} className="mt-1.5" aria-label="Heart rate" />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Readout label="Blood pumped per minute" value={`${cardiacOutput(bpm).toFixed(1)} L`} />
        <Readout label="Beats per day" value={(bpm * 60 * 24).toLocaleString('en-IN')} />
        <Readout label="Blood pumped per day" value={`${Math.round(cardiacOutput(bpm) * 60 * 24).toLocaleString('en-IN')} L`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each heartbeat pushes about 70 mL of blood into the arteries, making the <b>pulse</b> you can feel on your wrist or neck. An adult's whole blood supply (about 5 litres) goes round the body roughly once a minute at rest! A doctor listens to the heart with a <b>stethoscope</b>, invented by René Laennec in 1816.</p>
    </div>
  )
}

function Blood() {
  const [sel, setSel] = useState('rbc')
  const b = BLOOD.find((x) => x.id === sel)!
  return (
    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
      <div className="flex h-64 w-20 flex-col-reverse overflow-hidden justify-self-center rounded-b-2xl border-2 border-slate-400">
        <div className="bg-red-700" style={{ height: '44%' }} title="Red blood cells" />
        <div className="bg-slate-100" style={{ height: '1%' }} title="White cells and platelets" />
        <div className="bg-amber-200" style={{ height: '55%' }} title="Plasma" />
      </div>
      <div className="space-y-2">
        <p className="text-sm">A blood sample spun in a centrifuge separates into layers:</p>
        <div className="flex flex-wrap gap-1.5">{BLOOD.map((x) => <Button key={x.id} size="sm" variant={x.id === sel ? 'default' : 'outline'} onClick={() => setSel(x.id)}>{x.name}</Button>)}</div>
        <Readout label={b.name} value={`about ${b.share}% of blood`} />
        <p className="rounded-lg bg-chem-soft p-3 text-sm"><b>Job:</b> {b.job}.</p>
      </div>
    </div>
  )
}
