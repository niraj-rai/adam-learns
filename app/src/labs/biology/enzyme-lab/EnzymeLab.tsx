import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ENZYMES, activity } from './model'

export default function EnzymeLab() {
  const [id, setId] = useState('amylase')
  const [T, setT] = useState(37)
  const [pH, setPH] = useState(7)
  const e = ENZYMES.find((x) => x.id === id)!
  const a = activity(e, T, pH)
  const time = a > 0.02 ? Math.round(60 / a) : null // seconds to digest the test sample
  const W = 280
  const H = 140
  const curve = (f: (x: number) => number, xs: number[]) => xs.map((x, i) => `${20 + (i / (xs.length - 1)) * (W - 30)},${H - 15 - f(x) * (H - 30)}`).join(' ')
  const Ts = Array.from({ length: 71 }, (_, i) => i)
  const pHs = Array.from({ length: 57 }, (_, i) => 1 + i * 0.2)
  return (
    <LabFrame labId="enzyme-lab" title="Enzyme Lab" subtitle="Enzymes are biological catalysts. Each works best at its own temperature and pH." howTo={<p>Choose a digestive enzyme and change the temperature and pH. Watch how fast it digests its food, and read the activity graphs.</p>}>
      <div className="flex flex-wrap gap-1">{ENZYMES.map((x) => <button key={x.id} type="button" aria-pressed={id === x.id} onClick={() => setId(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', id === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}</div>
      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm"><b>{e.where}:</b> {e.substrate} → {e.product}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Temperature <b>{T} °C</b><Slider value={[T]} min={0} max={70} step={1} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="temperature" /></label>
        <label className="text-sm">pH <b>{pH.toFixed(1)}</b><Slider value={[pH]} min={1} max={12} step={0.5} onValueChange={([v]) => setPH(v)} className="mt-1" aria-label="pH" /></label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Activity" value={`${Math.round(a * 100)}%`} />
        <Readout label="Time to digest the sample" value={time ? `${time} s` : 'It doesn’t'} />
        <Readout label="State of the enzyme" value={T > 45 ? '❌ Denatured (shape destroyed)' : a > 0.7 ? '✅ Near its optimum' : 'Working slowly'} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {[{ label: 'activity vs temperature (°C)', pts: curve((x) => activity(e, x, e.optimumPH), Ts), mark: 20 + (T / 70) * (W - 30) }, { label: 'activity vs pH', pts: curve((x) => activity(e, e.optimumT, x), pHs), mark: 20 + ((pH - 1) / 11) * (W - 30) }].map((g) => (
          <svg key={g.label} viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={g.label}>
            <line x1={20} y1={H - 15} x2={W - 10} y2={H - 15} stroke="currentColor" /><line x1={20} y1={10} x2={20} y2={H - 15} stroke="currentColor" />
            <polyline points={g.pts} fill="none" stroke="#10b981" strokeWidth={2.5} />
            <line x1={g.mark} y1={10} x2={g.mark} y2={H - 15} stroke="#ef4444" strokeDasharray="3 3" />
            <text x={W - 12} y={H - 3} textAnchor="end" fontSize={9} fill="currentColor">{g.label}</text>
          </svg>
        ))}
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Enzymes are proteins with an <b>active site</b> that fits their substrate like a lock and key. Warming speeds them up, but above about 45 °C the active site changes shape: the enzyme is <b>denatured</b> and stops working. Each enzyme has its own <b>optimum pH</b>: pepsin works in the acidic stomach, trypsin and lipase in the alkaline small intestine.</p>
    </LabFrame>
  )
}
