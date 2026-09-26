import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { makeWater } from '../_shared/quantities'

const SOURCES = [
  { name: 'Rain water', emoji: '🌧️' },
  { name: 'Ganga water (purified)', emoji: '🏞️' },
  { name: 'Water made in a lab', emoji: '🧪' },
  { name: 'Ice from Antarctica', emoji: '🧊' },
]

export default function ConstantProportions() {
  const [h, setH] = useState(3)
  const [o, setO] = useState(16)
  const [src, setSrc] = useState(0)
  const r = makeWater(h, o)
  const used = { h: h - r.leftH, o: o - r.leftO }
  const f = (x: number) => (Math.round(x * 100) / 100).toString()
  return (
    <LabFrame labId="constant-proportions" title="Laws of Chemical Combination" subtitle="Mass is never lost in a reaction, and a compound always contains its elements in the same fixed ratio by mass." howTo={<p>Choose how many grams of hydrogen and oxygen to react. See how much water forms and what is left over. Then compare pure water from different sources.</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Hydrogen <b>{h} g</b><Slider value={[h]} min={0} max={10} step={0.5} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="hydrogen mass" /></label>
        <label className="text-sm">Oxygen <b>{o} g</b><Slider value={[o]} min={0} max={64} step={1} onValueChange={([v]) => setO(v)} className="mt-1" aria-label="oxygen mass" /></label>
      </div>
      <div className="mt-3 grid items-center gap-2 text-center sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground uppercase">Before</p><p className="font-heading text-lg">{h} g H₂ + {o} g O₂</p><p className="text-sm">Total {f(h + o)} g</p></div>
        <span className="text-2xl">➡️🔥</span>
        <div className="rounded-2xl border p-3"><p className="text-xs text-muted-foreground uppercase">After</p><p className="font-heading text-lg">{f(r.water)} g water</p><p className="text-sm">{r.leftH > 0 && `+ ${f(r.leftH)} g H₂ left `}{r.leftO > 0 && `+ ${f(r.leftO)} g O₂ left `}· Total {f(r.water + r.leftH + r.leftO)} g</p></div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Hydrogen used : oxygen used" value={used.h ? `${f(used.h)} : ${f(used.o)} = 1 : 8` : '—'} />
        <Readout label="Conservation of mass" value={`${f(h + o)} g → ${f(r.water + r.leftH + r.leftO)} g ✔`} />
        <Readout label="Limiting reactant" value={r.leftH > 0 ? 'Oxygen ran out' : r.leftO > 0 ? 'Hydrogen ran out' : h + o ? 'Both used up exactly!' : '—'} />
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">💧 Test pure water from anywhere</p>
        <div className="mt-2 flex flex-wrap gap-1">{SOURCES.map((s, i) => <button key={s.name} type="button" aria-pressed={src === i} onClick={() => setSrc(i)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', src === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>)}</div>
        <p className="mt-2 text-sm">Decomposing 90 g of pure water from <b>{SOURCES[src].name.toLowerCase()}</b> always gives <b>10 g hydrogen</b> and <b>80 g oxygen</b>: the same 1 : 8 ratio by mass.</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Law of conservation of mass</b> (Lavoisier): mass is neither created nor destroyed in a chemical reaction. <b>Law of constant proportions</b> (Proust): a pure compound always contains the same elements in the same proportion by mass. Dalton explained both: matter is made of atoms that are rearranged, never created or destroyed, and they combine in fixed whole-number ratios.</p>
    </LabFrame>
  )
}
