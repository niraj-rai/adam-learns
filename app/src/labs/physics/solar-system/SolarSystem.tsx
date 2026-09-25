import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { lightMinutes, PLANETS, scaleModel } from './model'

export default function SolarSystem() {
  const [tab, setTab] = useState<'orbits' | 'scale'>('orbits')
  return (
    <LabFrame labId="solar-system" title="Solar System Explorer" subtitle="Eight planets orbit the Sun. The distances are far bigger than any picture can show!" howTo={<p>Tab 1: watch the planets orbit (distances squashed to fit) and tap one for facts. Tab 2: build a scale model in your school grounds with a football as the Sun.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['orbits', '🪐 Orbits'], ['scale', '⚽ Scale walk']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'orbits' ? <Orbits /> : <Scale />}
    </LabFrame>
  )
}

function Orbits() {
  const [t, setT] = useState(0) // Earth years
  const [speed, setSpeed] = useState(1)
  const [sel, setSel] = useState('earth')
  useAnimationFrame((dt) => setT((x) => x + dt * 0.25 * speed))
  const p = PLANETS.find((x) => x.id === sel)!
  const rOf = (au: number) => 22 + Math.sqrt(au) * 30 // squashed distances so everything fits
  return (
    <div className="space-y-3">
      <svg viewBox="-200 -200 400 400" className="mx-auto w-full max-w-md rounded-2xl border bg-slate-950" role="img" aria-label="Planets orbiting the Sun (distances not to scale)">
        <circle r={12} fill="#fbbf24" />
        {PLANETS.map((q) => {
          const r = rOf(q.au)
          const a = (t / q.years) * 2 * Math.PI
          const size = Math.max(3, Math.log10(q.km) * 2.4 - 6)
          return (
            <g key={q.id} onClick={() => setSel(q.id)} className="cursor-pointer">
              <circle r={r} fill="none" stroke={q.id === sel ? '#94a3b8' : '#1e293b'} />
              <circle cx={r * Math.cos(a)} cy={-r * Math.sin(a)} r={size} fill={q.colour} stroke={q.id === sel ? '#fff' : 'none'} />
              {q.id === 'saturn' && <ellipse cx={r * Math.cos(a)} cy={-r * Math.sin(a)} rx={size + 5} ry={2} fill="none" stroke="#fde68a" />}
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-1.5">
        {PLANETS.map((q) => <button key={q.id} type="button" onClick={() => setSel(q.id)} className={cn('rounded-full border px-2.5 py-1 text-xs', q.id === sel ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{q.emoji} {q.name}</button>)}
      </div>
      <label className="block text-sm">Speed: <b>{speed}×</b>
        <Slider value={[speed]} min={0} max={20} step={1} onValueChange={([v]) => setSpeed(v)} className="mt-1.5" aria-label="Animation speed" />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Readout label="Distance from the Sun" value={`${p.au} AU`} />
        <Readout label="Diameter" value={`${p.km.toLocaleString('en-IN')} km`} />
        <Readout label="One orbit (year)" value={p.years < 1 ? `${Math.round(p.years * 365)} days` : `${p.years} Earth years`} />
        <Readout label="Sunlight takes" value={`${lightMinutes(p.au).toFixed(1)} min`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>{p.name}:</b> {p.fact} <span className="text-muted-foreground">(1 AU = the Earth–Sun distance, about 150 million km.)</span></p>
    </div>
  )
}

function Scale() {
  const [sun, setSun] = useState(22)
  const model = scaleModel(sun)
  return (
    <div className="space-y-3">
      <label className="block text-sm">Size of your model Sun: <b>{sun} cm</b> {sun === 22 ? '(a football)' : ''}
        <Slider value={[sun]} min={5} max={100} step={1} onValueChange={([v]) => setSun(v)} className="mt-1.5" aria-label="Model Sun size" />
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left"><th className="py-1">Planet</th><th>Model size</th><th>Distance from the model Sun</th></tr></thead>
          <tbody>
            {model.map((p) => (
              <tr key={p.id} className="border-b border-dashed">
                <td className="py-1">{p.emoji} {p.name}</td>
                <td>{p.sizeMm < 10 ? `${p.sizeMm.toFixed(1)} mm` : `${(p.sizeMm / 10).toFixed(1)} cm`}</td>
                <td>{p.distanceM < 1000 ? `${p.distanceM.toFixed(0)} m` : `${(p.distanceM / 1000).toFixed(2)} km`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">With a football-sized Sun, Earth is a peppercorn about 24 m away, and Neptune is a grain-sized ball about 700 m away! Space is mostly... space. Pictures of the Solar System can never show sizes and distances to scale at the same time.</p>
    </div>
  )
}
