import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { EARTH_RADIUS_KM, gAtHeight, weight } from '../_shared/dynamics'
import { ORBITS, WORLDS, jumpHeight, scaleReading } from './model'

export default function WeightOnWorlds() {
  const [mass, setMass] = useState(50)
  const [wid, setWid] = useState('moon')
  const [h, setH] = useState(400)
  const world = WORLDS.find((w) => w.id === wid)!
  const W = weight(mass, world.g)
  const stretch = Math.min(100, W / 22)
  const gh = gAtHeight(h)
  // orbit picture: Earth radius 15 px, heights on the same scale
  const R = 15
  const r = R * (1 + h / EARTH_RADIUS_KM)
  const fmt = (x: number) => x.toFixed(x < 10 ? 2 : 1)

  return (
    <LabFrame labId="weight-on-worlds" title="Weight on Other Worlds" subtitle="Your mass is the same everywhere. Your weight depends on the gravity where you are." howTo={<p>Pick a world and your mass. Then use the height slider to fly away from Earth and watch gravity weaken.</p>}>
      <div className="flex flex-wrap gap-1">
        {WORLDS.map((w) => <button key={w.id} type="button" aria-pressed={wid === w.id} onClick={() => setWid(w.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', wid === w.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{w.emoji} {w.name} <span className="text-xs text-muted-foreground">g = {w.g}</span></button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[180px_1fr]">
        <svg viewBox="0 0 180 200" className="w-full max-w-[180px] rounded-2xl border bg-background" role="img" aria-label={`Spring balance stretched by a weight of ${W.toFixed(0)} N`}>
          <rect x={70} y={6} width={40} height={8} fill="#64748b" />
          <path d={`M90,14 ${Array.from({ length: 10 }, (_, i) => `L${i % 2 ? 80 : 100},${14 + ((i + 1) * (30 + stretch)) / 10}`).join(' ')} L90,${44 + stretch + 3}`} fill="none" stroke="#475569" strokeWidth={2} />
          <rect x={65} y={44 + stretch + 3} width={50} height={36} rx={4} fill="#d97706" />
          <text x={90} y={44 + stretch + 26} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{mass} kg</text>
          <text x={90} y={195} textAnchor="middle" fontSize={12} fill="currentColor" fontWeight={600}>{W.toFixed(0)} N</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Your mass <b>{mass} kg</b><Slider value={[mass]} min={10} max={100} step={5} onValueChange={([v]) => setMass(v)} className="mt-1" aria-label="mass" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Mass (same everywhere)" value={`${mass} kg`} />
            <Readout label={`Weight W = mg on ${world.name}`} value={`${mass} × ${world.g} = ${W.toFixed(0)} N`} />
            <Readout label="An Earth bathroom scale shows" value={`${scaleReading(mass, world.g).toFixed(1)} kg`} />
            <Readout label="A 50 cm Earth jump becomes" value={`${jumpHeight(0.5, world.g).toFixed(2)} m`} />
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-4 rounded-2xl border p-3 md:grid-cols-[220px_1fr]">
        <svg viewBox="-110 -110 220 220" className="w-full max-w-[220px]" role="img" aria-label={`A spacecraft ${h} km above Earth`}>
          {ORBITS.map((o) => <circle key={o.name} r={R * (1 + o.km / EARTH_RADIUS_KM)} fill="none" stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />)}
          <circle r={R} fill="#3b82f6" /><text y={4} textAnchor="middle" fontSize={12}>🌍</text>
          <line x1={0} y1={0} x2={r * Math.cos(-0.6)} y2={r * Math.sin(-0.6)} stroke="#ef4444" strokeDasharray="4 3" />
          <text x={r * Math.cos(-0.6)} y={r * Math.sin(-0.6) + 5} textAnchor="middle" fontSize={16}>🛰️</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Height above Earth's surface <b>{h.toLocaleString('en-IN')} km</b><Slider value={[h]} min={0} max={36000} step={100} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height above Earth" /></label>
          <div className="flex flex-wrap gap-1 text-xs">{[{ name: 'Ground', km: 0 }, ...ORBITS].map((o) => <button key={o.name} type="button" onClick={() => setH(o.km)} className="rounded-full border px-2 py-0.5 hover:bg-muted">{o.name} ({o.km.toLocaleString('en-IN')} km)</button>)}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Gravity g here" value={`${fmt(gh)} N/kg`} />
            <Readout label={`Weight of your ${mass} kg`} value={`${(mass * gh).toFixed(0)} N`} />
          </div>
          <p className="text-sm text-muted-foreground">Double your distance from Earth's <i>centre</i> and gravity drops to a quarter: F = G m₁m₂ ÷ r² (the inverse square law). Astronauts on the ISS still feel about 89% of Earth's gravity: they float because they are falling around the Earth all the time.</p>
        </div>
      </div>
    </LabFrame>
  )
}
