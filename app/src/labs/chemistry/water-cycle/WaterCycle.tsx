import { useMemo, useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const STEPS = [
  { name: 'Evaporation', emoji: '☀️', text: 'The Sun heats water in seas, rivers and ponds. It turns into invisible water vapour and rises.' },
  { name: 'Condensation', emoji: '☁️', text: 'High up it is cold, so the vapour cools into tiny droplets that make clouds.' },
  { name: 'Precipitation', emoji: '🌧️', text: 'Droplets join and grow heavy, falling as rain, snow or hail.' },
  { name: 'Collection', emoji: '🏞️', text: 'Water flows into rivers, lakes and the sea, or soaks into the ground as groundwater. Then it all begins again.' },
]

export default function WaterCycle() {
  const [t, setT] = useState(25)
  const [step, setStep] = useState(0)
  const state = t <= 0 ? 'ice' : t < 100 ? 'water' : 'steam'
  const dots = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ i, r1: Math.random(), r2: Math.random() })), [])
  const pos = (d: (typeof dots)[number]) => state === 'ice' ? { x: 40 + (d.i % 6) * 22, y: 120 + Math.floor(d.i / 6) * 22 } : state === 'water' ? { x: 30 + d.r1 * 140, y: 110 + d.r2 * 80 } : { x: 20 + d.r1 * 160, y: 20 + d.r2 * 170 }
  return (
    <LabFrame labId="water-cycle" title="Water: Ice, Water, Steam" subtitle="Water can be solid, liquid or gas. Heating and cooling change its state, and the Sun drives the water cycle." howTo={<p>Change the temperature and watch the particles. Then tap each step of the water cycle.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 200 210" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Water as ${state} at ${t} °C`}>
          <rect x={20} y={100} width={160} height={100} fill="none" stroke="currentColor" opacity={0.4} rx={6} />
          {state === 'water' && <rect x={21} y={105} width={158} height={94} fill="#38bdf833" />}
          {dots.map((d) => { const p = pos(d); return <circle key={d.i} cx={p.x} cy={p.y} r={6} fill={state === 'ice' ? '#bae6fd' : '#0ea5e9'} className="transition-all duration-700" /> })}
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Temperature: <b>{t} °C</b><Slider value={[t]} min={-20} max={120} step={1} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="temperature" /></label>
          <Readout label="State" value={state === 'ice' ? '🧊 Solid (ice)' : state === 'water' ? '💧 Liquid (water)' : '♨️ Gas (steam / water vapour)'} />
          <p className="text-sm text-muted-foreground">{state === 'ice' ? 'Particles are packed tightly and only wobble. Ice melts at 0 °C.' : state === 'water' ? 'Particles are close but slide past each other, so water flows. It boils at 100 °C.' : 'Particles are far apart and zoom around. Steam condenses back to water when it cools.'}</p>
        </div>
      </div>
      <h3 className="mt-4 font-semibold">The water cycle</h3>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{STEPS.map((s, i) => <button key={s.name} type="button" aria-pressed={step === i} onClick={() => setStep(i)} className={cn('rounded-xl border-2 p-2 text-sm', step === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {i + 1}. {s.name}</button>)}</div>
      <p className="mt-2 rounded-xl border px-3 py-2 text-sm">{STEPS[step].text}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Only about 3% of Earth’s water is fresh, and most of that is frozen. Every drop you drink has been round the water cycle many times. Stepwells (baolis) and tanks in India were built to <b>collect and save</b> rainwater.</p>
    </LabFrame>
  )
}
