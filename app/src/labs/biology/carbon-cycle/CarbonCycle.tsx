import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { projectCO2, warmingFromCO2 } from '../_shared/earthSystem'

const CYCLES = {
  carbon: { emoji: '⚫', steps: ['Plants take in CO₂ by photosynthesis', 'Animals eat plants; carbon moves up food chains', 'Respiration by all living things returns CO₂', 'Decomposers break down dead matter, releasing CO₂', 'Some carbon is buried for millions of years as coal, oil and gas', 'Burning fossil fuels releases that ancient carbon quickly', 'Oceans dissolve CO₂ (and become more acidic)'] },
  nitrogen: { emoji: '🟣', steps: ['Air is 78% nitrogen gas, but most living things can’t use it directly', 'Bacteria in soil and legume root nodules fix N₂ into ammonium', 'Lightning also fixes a little nitrogen', 'Nitrifying bacteria turn ammonium into nitrates', 'Plants absorb nitrates to make proteins', 'Decomposers return nitrogen from dead matter to the soil', 'Denitrifying bacteria release N₂ back to the air'] },
  water: { emoji: '💧', steps: ['The Sun evaporates water from oceans', 'Plants release water vapour by transpiration', 'Vapour condenses into clouds', 'Precipitation falls as rain and snow', 'Water runs off into rivers or soaks into groundwater', 'Ice sheets and glaciers store water for thousands of years'] },
  oxygen: { emoji: '🫧', steps: ['Photosynthesis releases O₂ (phytoplankton make about half of it)', 'Respiration and decay use O₂', 'Burning uses O₂', 'O₂ in the upper atmosphere forms the ozone layer', 'Oxygen is locked in rocks and water too'] },
} as const
type C = keyof typeof CYCLES

export default function CarbonCycle() {
  const [c, setC] = useState<C>('carbon')
  const [trend, setTrend] = useState(0)
  const [forest, setForest] = useState(0)
  const series = projectCO2(trend, forest)
  const end = series.at(-1)!
  const W = 300, H = 150
  const X = (y: number) => 30 + ((y - 2025) / 75) * (W - 40)
  const Y = (p: number) => H - 20 - ((p - 300) / 500) * (H - 30)
  return (
    <LabFrame labId="carbon-cycle" title="Cycles of Matter" subtitle="Carbon, nitrogen, water and oxygen move endlessly between air, water, rock and life. Humans are speeding up the carbon cycle." howTo={<p>Explore each cycle step by step. Then use the model to see how emissions and forests change CO₂ by 2100.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">{(Object.keys(CYCLES) as C[]).map((k) => <button key={k} type="button" aria-pressed={c === k} onClick={() => setC(k)} className={cn('rounded-lg border-2 px-3 py-1 text-sm capitalize', c === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{CYCLES[k].emoji} {k}</button>)}</div>
      <ol className="grid gap-1 sm:grid-cols-2">{CYCLES[c].steps.map((s, i) => <li key={s} className="rounded-lg border px-3 py-1.5 text-sm"><b>{i + 1}.</b> {s}</li>)}</ol>
      <h3 className="mt-4 font-semibold">⚫ Carbon model: 2025 to 2100</h3>
      <div className="mt-2 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`CO₂ reaches ${end.ppm.toFixed(0)} ppm in 2100`}>
          <line x1={30} y1={H - 20} x2={W - 10} y2={H - 20} stroke="currentColor" opacity={0.4} />
          <line x1={30} y1={10} x2={30} y2={H - 20} stroke="currentColor" opacity={0.4} />
          {[300, 400, 500, 600, 700, 800].map((p) => <text key={p} x={26} y={Y(p) + 3} textAnchor="end" fontSize={8} fill="currentColor">{p}</text>)}
          {[2025, 2050, 2075, 2100].map((y) => <text key={y} x={X(y)} y={H - 6} textAnchor="middle" fontSize={8} fill="currentColor">{y}</text>)}
          <line x1={30} y1={Y(280)} x2={W - 10} y2={Y(280)} stroke="#10b981" strokeDasharray="3 3" />
          <polyline points={series.map((s) => `${X(s.year)},${Y(Math.min(800, Math.max(300, s.ppm)))}`).join(' ')} fill="none" stroke="#dc2626" strokeWidth={2.5} />
          <text x={W - 12} y={18} textAnchor="end" fontSize={9} fill="currentColor">CO₂ (ppm)</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Change in fossil-fuel emissions each year: <b>{trend > 0 ? '+' : ''}{trend}%</b><Slider value={[trend]} min={-10} max={3} step={0.5} onValueChange={([v]) => setTrend(v)} className="mt-1" aria-label="emissions trend" /></label>
          <label className="block text-sm">Carbon taken up by new forests: <b>{forest} GtC/year</b><Slider value={[forest]} min={0} max={3} step={0.5} onValueChange={([v]) => setForest(v)} className="mt-1" aria-label="forest uptake" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="CO₂ in 2100" value={`${end.ppm.toFixed(0)} ppm`} />
            <Readout label="Warming vs pre-industrial" value={`${warmingFromCO2(end.ppm).toFixed(1)} °C`} />
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Before industry, CO₂ was about <b>280 ppm</b> (green line); in 2025 it passed <b>425 ppm</b>. About 45% of the carbon we emit stays in the air; oceans and land absorb the rest. India’s National Solar Mission and forest-restoration pledges aim to bend this curve. (A simple teaching model: real projections are more complex.)</p>
    </LabFrame>
  )
}
