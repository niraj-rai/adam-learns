import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const PATHS = [
  { id: 'aerobic', name: 'Aerobic (with oxygen)', emoji: '🫁', where: 'Mitochondria of most cells', eq: 'Glucose + oxygen → carbon dioxide + water + lots of energy', atp: 38, note: 'Glucose is broken down completely. Most of your cells do this all the time.' },
  { id: 'yeast', name: 'Anaerobic in yeast', emoji: '🍞', where: 'Yeast cells', eq: 'Glucose → ethanol + carbon dioxide + a little energy', atp: 2, note: 'Fermentation: the CO₂ makes idli and bread batter rise; the ethanol is used to make fuel.' },
  { id: 'muscle', name: 'Anaerobic in muscles', emoji: '🏃', where: 'Muscle cells during hard exercise', eq: 'Glucose → lactic acid + a little energy', atp: 2, note: 'When oxygen runs short, lactic acid builds up and can cause cramps. It is broken down later with oxygen.' },
]

export default function RespirationLab() {
  const [pid, setPid] = useState('aerobic')
  const [effort, setEffort] = useState(40)
  const p = PATHS.find((x) => x.id === pid)!
  const oxygenSupply = 70 // what the heart and lungs can deliver (arbitrary units)
  const demand = effort
  const anaerobic = Math.max(0, demand - oxygenSupply)
  const lactic = Math.min(100, anaerobic * 2.5)
  return (
    <LabFrame labId="respiration-lab" title="Respiration" subtitle="All living cells release energy from glucose. With oxygen they get far more energy than without it." howTo={<p>Compare the three pathways. Then push your exercise effort up and see when your muscles switch to anaerobic respiration.</p>}>
      <div className="flex flex-wrap gap-1">{PATHS.map((x) => <button key={x.id} type="button" aria-pressed={pid === x.id} onClick={() => setPid(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pid === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}</div>
      <div className="mt-3 rounded-2xl bg-muted/50 p-4"><p className="text-xs text-muted-foreground uppercase">{p.where}</p><p className="mt-1 font-mono text-sm">{p.eq}</p><p className="mt-2 text-sm">{p.note}</p></div>
      <div className="mt-3 space-y-1">{PATHS.map((x) => <div key={x.id} className="flex items-center gap-2 text-xs"><span className="w-40 shrink-0">{x.emoji} {x.name}</span><div className="h-4 flex-1 rounded-full bg-muted"><div className={cn('h-full rounded-full', x.id === pid ? 'bg-chem' : 'bg-chem/40')} style={{ width: `${(x.atp / 38) * 100}%` }} /></div><span className="w-16 text-right font-mono">{x.atp} ATP</span></div>)}</div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🏃 Exercise test</p>
        <label className="mt-2 block text-sm">Exercise effort <b>{effort}%</b><Slider value={[effort]} min={0} max={100} step={5} onValueChange={([v]) => setEffort(v)} className="mt-1" aria-label="exercise effort" /></label>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <Readout label="Breathing and heart rate" value={effort < 30 ? 'Resting' : effort < 70 ? 'Faster' : 'Very fast'} />
          <Readout label="Energy mainly from" value={anaerobic > 0 ? 'Aerobic + anaerobic' : 'Aerobic'} />
          <Readout label="Lactic acid build-up" value={`${Math.round(lactic)}%`} />
        </div>
        <div className="mt-2 h-3 rounded-full bg-muted"><div className="h-full rounded-full bg-destructive/70" style={{ width: `${lactic}%` }} /></div>
        <p className="mt-2 text-sm text-muted-foreground">{anaerobic > 0 ? 'Your muscles need more oxygen than your blood can bring, so some cells respire anaerobically: lactic acid builds up and you owe an “oxygen debt”.' : 'Your lungs and heart supply enough oxygen: aerobic respiration only.'}</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">In all types, glucose is first split into <b>pyruvate</b> in the cytoplasm. With oxygen, pyruvate is broken down fully in the <b>mitochondria</b>, releasing much more energy, stored as <b>ATP</b>. Respiration is not the same as breathing: breathing moves air; respiration is the chemical reaction in cells.</p>
    </LabFrame>
  )
}
