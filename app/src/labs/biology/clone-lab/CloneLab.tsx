import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { METHODS, afterFission, generations } from './model'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

function Picture({ id, step }: { id: string; step: number }) {
  // step 0..2
  if (id === 'fission') return <g>{step === 0 ? <ellipse cx={150} cy={60} rx={50} ry={34} fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} /> : step === 1 ? <path d="M100,60 C100,20 150,30 150,45 C150,30 200,20 200,60 C200,100 150,90 150,75 C150,90 100,100 100,60 Z" fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} /> : <><ellipse cx={100} cy={60} rx={38} ry={28} fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} /><ellipse cx={200} cy={60} rx={38} ry={28} fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} /></>}{(step < 2 ? [[step === 1 ? 128 : 150, 60], ...(step === 1 ? [[172, 60]] : [])] : [[100, 60], [200, 60]]).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#1d4ed8" />)}</g>
  if (id === 'budding') return <g><rect x={130} y={20} width={40} height={90} rx={18} fill="#bbf7d0" stroke="#15803d" strokeWidth={2} />{range(4).map((i) => <path key={i} d={`M${135 + i * 10},22 q${-10 + i * 7},-18 ${-4 + i * 4},-18`} stroke="#15803d" strokeWidth={2} fill="none" />)}{step >= 1 && <ellipse cx={step === 2 ? 215 : 180} cy={70} rx={step === 1 ? 10 : 16} ry={step === 1 ? 14 : 28} fill="#bbf7d0" stroke="#15803d" strokeWidth={2} />}</g>
  if (id === 'fragmentation') return <g>{step === 0 ? <path d="M40,60 C90,40 140,80 190,60 S260,40 270,60" fill="none" stroke="#16a34a" strokeWidth={8} strokeLinecap="round" /> : range(3).map((i) => <path key={i} d={`M${40 + i * 80 + (step === 2 ? i * 6 : 0)},60 c20,-10 40,10 ${step === 2 ? 70 : 55},0`} fill="none" stroke="#16a34a" strokeWidth={8} strokeLinecap="round" />)}</g>
  if (id === 'regeneration') return <g>{step === 0 ? <path d="M60,60 C60,40 240,35 250,60 C240,85 60,80 60,60 Z" fill="#fde68a" stroke="#a16207" strokeWidth={2} /> : range(3).map((i) => <g key={i}><rect x={50 + i * 75} y={45} width={step === 2 ? 65 : 55} height={30} rx={step === 2 ? 15 : 3} fill="#fde68a" stroke="#a16207" strokeWidth={2} />{step === 2 && <><circle cx={62 + i * 75} cy={55} r={2.5} fill="#1c1917" /><circle cx={62 + i * 75} cy={65} r={2.5} fill="#1c1917" /></>}</g>)}{step === 0 && <><circle cx={75} cy={53} r={3} fill="#1c1917" /><circle cx={75} cy={67} r={3} fill="#1c1917" /></>}</g>
  if (id === 'spores') return <g><path d="M30,110 L270,110" stroke="#a16207" strokeWidth={6} />{range(4).map((i) => <g key={i}><line x1={60 + i * 60} y1={110} x2={60 + i * 60} y2={50} stroke="#57534e" strokeWidth={2} /><circle cx={60 + i * 60} cy={42} r={step === 2 ? 6 : 12} fill="#1c1917" /></g>)}{step >= 1 && range(step === 2 ? 30 : 12).map((i) => <circle key={`s${i}`} cx={40 + ((i * 53) % 230)} cy={10 + ((i * 29) % (step === 2 ? 60 : 30))} r={2} fill="#44403c" />)}</g>
  return <g><ellipse cx={120} cy={70} rx={60} ry={40} fill="#d6b88a" stroke="#92400e" strokeWidth={2} />{[[90, 55], [140, 50], [150, 85]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={4} fill="#78350f" />{step >= 1 && <path d={`M${x},${y} q-4,${-15 - step * 8} ${6},${-25 - step * 10}`} stroke="#16a34a" strokeWidth={3} fill="none" />}{step === 2 && <ellipse cx={x + 8} cy={y - 38} rx={8} ry={4} fill="#22c55e" />}</g>)}</g>
}

export default function CloneLab() {
  const [mid, setMid] = useState('fission')
  const [step, setStep] = useState(0)
  const [minutes, setMinutes] = useState(20)
  const [hours, setHours] = useState(4)
  const m = METHODS.find((x) => x.id === mid)!
  const g = generations(hours * 60, minutes)
  const n = afterFission(g)
  return (
    <LabFrame labId="clone-lab" title="Clone Lab" subtitle="Asexual reproduction: one parent, no gametes, and offspring that are identical copies (clones)." howTo={<p>Pick a method and step through it. Then see how fast bacteria multiply by binary fission.</p>}>
      <div className="flex flex-wrap gap-1">
        {METHODS.map((x) => <button key={x.id} type="button" aria-pressed={mid === x.id} onClick={() => { setMid(x.id); setStep(0) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', mid === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 130" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${m.name}, stage ${step + 1} of 3`}><Picture id={mid} step={step} /></svg>
        <div className="space-y-2">
          <p className="font-heading text-xl font-semibold">{m.emoji} {m.name}</p>
          <p className="text-sm"><b>Examples:</b> {m.example}</p>
          <p className="text-sm">{m.how}</p>
          <div className="flex gap-2">{[0, 1, 2].map((s) => <button key={s} type="button" aria-pressed={step === s} onClick={() => setStep(s)} className={cn('rounded-full border-2 px-3 py-0.5 text-sm', step === s ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>Stage {s + 1}</button>)}</div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🦠 How fast can bacteria multiply?</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">One division every <b>{minutes} min</b><Slider value={[minutes]} min={10} max={60} step={5} onValueChange={([v]) => setMinutes(v)} className="mt-1" aria-label="minutes per division" /></label>
          <label className="text-sm">Time <b>{hours} h</b><Slider value={[hours]} min={1} max={10} step={1} onValueChange={([v]) => setHours(v)} className="mt-1" aria-label="hours" /></label>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Readout label="Generations" value={g} />
          <Readout label="Bacteria from one" value={`2^${g} = ${n.toLocaleString('en-IN')}`} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">This is why food left out in the warmth spoils so quickly, and why washing hands matters. In reality growth slows as food runs out.</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Asexual reproduction is <b>fast</b> and needs only one parent, but all the offspring are <b>genetically identical</b>. With no variation, a single disease or change in the environment can wipe out the whole population.</p>
    </LabFrame>
  )
}
