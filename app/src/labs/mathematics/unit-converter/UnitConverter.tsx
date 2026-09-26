import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SliderRow } from '../_shared/SliderRow'

const KINDS = {
  length: { emoji: '📏', label: 'Length', base: 'm', units: [{ u: 'km', f: 1000 }, { u: 'm', f: 1 }, { u: 'cm', f: 0.01 }, { u: 'mm', f: 0.001 }], max: 5000, step: 50, fact: 'A school running track is usually 400 m. 1 km = 1000 m, and 1 m = 100 cm.', eg: [[1, 'a big step'], [400, 'one lap of a track'], [1000, 'a 12-minute walk'], [4000, 'from home to a far school']] },
  mass: { emoji: '⚖️', label: 'Weight (mass)', base: 'g', units: [{ u: 'kg', f: 1000 }, { u: 'g', f: 1 }], max: 5000, step: 50, fact: '1 kg = 1000 g. A packet of salt is often 1 kg; a cricket ball is about 160 g.', eg: [[160, 'a cricket ball'], [1000, 'a packet of salt'], [3000, 'a newborn baby']] },
  capacity: { emoji: '🥛', label: 'Capacity', base: 'mL', units: [{ u: 'L', f: 1000 }, { u: 'mL', f: 1 }], max: 5000, step: 50, fact: '1 L = 1000 mL. A glass holds about 200 mL; a bucket about 10 L.', eg: [[5, 'a teaspoon'], [200, 'a glass of milk'], [1000, 'a water bottle']] },
  time: { emoji: '⏱️', label: 'Time', base: 's', units: [{ u: 'h', f: 3600 }, { u: 'min', f: 60 }, { u: 's', f: 1 }], max: 7200, step: 30, fact: '1 hour = 60 minutes and 1 minute = 60 seconds. Sprinters are timed to hundredths of a second!', eg: [[10, 'a 100 m sprint (fast!)'], [60, 'one minute'], [2700, 'a school period']] },
} as const
type Kind = keyof typeof KINDS

function split(v: number, units: readonly { u: string; f: number }[]) {
  let rest = v
  return units.map(({ u, f }) => { const q = Math.floor(rest / f + 1e-9); rest -= q * f; return q ? `${q} ${u}` : '' }).filter(Boolean).join(' ') || `0 ${units.at(-1)!.u}`
}

export default function UnitConverter() {
  const [kind, setKind] = useState<Kind>('length')
  const [v, setV] = useState(1250)
  const K = KINDS[kind]
  const near = [...K.eg].sort((a, b) => Math.abs(a[0] - v) - Math.abs(b[0] - v))[0]
  return (
    <LabFrame labId="unit-converter" title="Measure and Convert" subtitle="Big units and small units measure the same thing. Converting means multiplying or dividing by 10, 100, 1000 or 60." howTo={<p>Pick what to measure and slide the amount. See it in each unit, and a real-life example of about that size.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">{(Object.keys(KINDS) as Kind[]).map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setV(k === 'time' ? 150 : 1250) }} className={`rounded-lg border-2 px-3 py-1 text-sm ${kind === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{KINDS[k].emoji} {KINDS[k].label}</button>)}</div>
      <SliderRow label={`Amount (${K.base})`} value={v} shown={`${v} ${K.base}`} min={0} max={K.max} step={K.step} onChange={setV} />
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {K.units.map(({ u, f }) => <Readout key={u} label={`In ${u}`} value={`${+(v / f).toFixed(3)} ${u}`} />)}
      </div>
      <p className="mt-3 rounded-xl border px-3 py-2 text-sm"><b>Mixed units:</b> {split(v, K.units)} · <b>About the size of:</b> {near[1]}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{K.fact} To go from a big unit to a small unit, <b>multiply</b>; from small to big, <b>divide</b>.</p>
    </LabFrame>
  )
}
