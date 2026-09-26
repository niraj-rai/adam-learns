import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SOLUBILITY, solubilityAt } from '../_shared/quantities'

const W = 360
const H = 220
const X = (t: number) => 40 + (t / 100) * (W - 60)
const Y = (g: number) => H - 30 - (g / 250) * (H - 50)

export default function SolubilityCurve() {
  const [key, setKey] = useState('KNO3')
  const [temp, setTemp] = useState(60)
  const [added, setAdded] = useState(80)
  const [coolTo, setCoolTo] = useState(20)
  const max = solubilityAt(key, temp)
  const dissolved = Math.min(added, max)
  const leftover = Math.max(0, added - max)
  const crystals = Math.max(0, dissolved - solubilityAt(key, coolTo))
  const state = added < max - 0.5 ? 'unsaturated' : added <= max + 0.5 ? 'saturated' : 'saturated, with extra solid at the bottom'
  return (
    <LabFrame labId="solubility-curve" title="Solubility Curves" subtitle="How much solid dissolves in 100 g of water depends on the substance and the temperature." howTo={<p>Pick a substance, set the temperature and how much you add to 100 g of water. Then cool the solution to see crystals form.</p>}>
      <div className="flex flex-wrap gap-1">
        {Object.entries(SOLUBILITY).map(([k, v]) => <button key={k} type="button" aria-pressed={key === k} onClick={() => setKey(k)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', key === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}><span style={{ color: v.colour }}>●</span> {v.name}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label="Solubility curves">
          {[0, 50, 100, 150, 200, 250].map((g) => <g key={g}><line x1={40} y1={Y(g)} x2={W - 20} y2={Y(g)} stroke="currentColor" strokeOpacity={0.08} /><text x={34} y={Y(g) + 3} textAnchor="end" fontSize={9} fill="currentColor">{g}</text></g>)}
          {[0, 20, 40, 60, 80, 100].map((t) => <text key={t} x={X(t)} y={H - 16} textAnchor="middle" fontSize={9} fill="currentColor">{t}</text>)}
          <text x={W - 20} y={H - 4} textAnchor="end" fontSize={9} fill="currentColor">temperature (°C)</text>
          <text x={44} y={12} fontSize={9} fill="currentColor">g per 100 g water</text>
          {Object.entries(SOLUBILITY).map(([k, v]) => <polyline key={k} points={v.data.map((g, i) => `${X(i * 10)},${Y(g)}`).join(' ')} fill="none" stroke={v.colour} strokeWidth={k === key ? 3 : 1.5} opacity={k === key ? 1 : 0.35} />)}
          <circle cx={X(temp)} cy={Y(Math.min(added, 250))} r={5} fill="#ef4444" />
          <line x1={X(temp)} y1={Y(0)} x2={X(temp)} y2={Y(max)} stroke="#ef4444" strokeDasharray="3 3" />
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Temperature <b>{temp} °C</b><Slider value={[temp]} min={0} max={100} step={5} onValueChange={([v]) => setTemp(v)} className="mt-1" aria-label="temperature" /></label>
          <label className="block text-sm">Solid added to 100 g water <b>{added} g</b><Slider value={[added]} min={0} max={250} step={5} onValueChange={([v]) => setAdded(v)} className="mt-1" aria-label="solid added" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label={`Solubility at ${temp} °C`} value={`${max.toFixed(1)} g`} />
            <Readout label="Dissolved / left over" value={`${dissolved.toFixed(0)} g / ${leftover.toFixed(0)} g`} />
          </div>
          <p className={cn('rounded-xl px-3 py-2 text-sm', state === 'unsaturated' ? 'bg-success-soft' : 'bg-warn-soft')}>The solution is <b>{state}</b>.</p>
          <label className="block text-sm">Now cool it to <b>{coolTo} °C</b><Slider value={[coolTo]} min={0} max={temp} step={5} onValueChange={([v]) => setCoolTo(v)} className="mt-1" aria-label="cool to temperature" /></label>
          <Readout label="Crystals that form on cooling" value={`${crystals.toFixed(1)} g`} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>saturated</b> solution holds as much solute as it can at that temperature. For most solids, solubility rises with temperature: potassium nitrate's rises steeply, but salt's hardly changes. Cooling a hot saturated solution makes crystals form: that's how pure crystals (like copper sulfate) are made by <b>crystallisation</b>.</p>
    </LabFrame>
  )
}
