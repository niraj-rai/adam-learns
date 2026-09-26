import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SOLAR_CONSTANT, surfaceTemp } from '../_shared/earthSystem'

const SURFACES = [['Fresh snow', 0.85], ['Sea ice', 0.6], ['Desert sand', 0.4], ['Grassland', 0.25], ['Forest', 0.15], ['Open ocean', 0.06]] as const

export default function GreenhouseLab() {
  const [albedo, setAlbedo] = useState(0.3)
  const [eps, setEps] = useState(0.78)
  const T = surfaceTemp(albedo, eps)
  const bare = surfaceTemp(albedo, 0)
  const absorbed = (SOLAR_CONSTANT * (1 - albedo)) / 4
  return (
    <LabFrame labId="greenhouse-lab" title="Earth’s Energy Balance" subtitle="Earth warms until the energy it sends out as infrared equals the sunlight it absorbs. Reflection and greenhouse gases set the temperature." howTo={<p>Change how reflective Earth is (albedo) and how strongly the atmosphere traps outgoing heat. Watch the average surface temperature.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 220" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Average surface temperature ${T.toFixed(1)} degrees Celsius`}>
          <circle cx={30} cy={30} r={22} fill="#facc15" />
          <rect x={0} y={170} width={300} height={50} fill={T > 25 ? '#b45309' : T < 0 ? '#e0f2fe' : '#15803d'} />
          <rect x={0} y={60} width={300} height={40} fill="#94a3b8" opacity={eps * 0.5} />
          <text x={292} y={84} textAnchor="end" fontSize={10} fill="white">greenhouse gases</text>
          <line x1={50} y1={45} x2={120} y2={168} stroke="#facc15" strokeWidth={4} />
          <line x1={120} y1={168} x2={160} y2={60} stroke="#facc15" strokeWidth={Math.max(1, albedo * 10)} strokeDasharray="4 3" />
          <text x={166} y={56} fontSize={10} fill="#facc15">reflected {Math.round(albedo * 100)}%</text>
          <line x1={200} y1={168} x2={220} y2={100} stroke="#f97316" strokeWidth={3} />
          <line x1={220} y1={100} x2={205} y2={160} stroke="#f97316" strokeWidth={Math.max(1, eps * 4)} strokeDasharray="3 3" />
          <line x1={220} y1={60} x2={230} y2={15} stroke="#f97316" strokeWidth={Math.max(1, (1 - eps / 2) * 4)} />
          <text x={236} y={20} fontSize={10} fill="#f97316">infrared out</text>
          <text x={150} y={200} textAnchor="middle" fontSize={16} fontWeight={700} fill={T < 0 ? '#0f172a' : 'white'}>{T.toFixed(1)} °C</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Albedo (share of sunlight reflected): <b>{albedo.toFixed(2)}</b><Slider value={[albedo]} min={0.05} max={0.8} step={0.01} onValueChange={([v]) => setAlbedo(v)} className="mt-1" aria-label="albedo" /></label>
          <label className="block text-sm">Infrared trapped by the atmosphere: <b>{Math.round(eps * 100)}%</b><Slider value={[eps]} min={0} max={1} step={0.01} onValueChange={([v]) => setEps(v)} className="mt-1" aria-label="greenhouse strength" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Average surface temperature" value={`${T.toFixed(1)} °C`} />
            <Readout label="With no greenhouse gases" value={`${bare.toFixed(1)} °C`} />
            <Readout label="Sunlight absorbed (per m²)" value={`${absorbed.toFixed(0)} W`} />
            <Readout label="Greenhouse warming" value={`+${(T - bare).toFixed(1)} °C`} />
          </div>
          <div className="flex flex-wrap gap-1">{SURFACES.map(([n, a]) => <button key={n} type="button" onClick={() => setAlbedo(a)} className="rounded-lg border px-2 py-0.5 text-xs hover:bg-muted">{n} ({a})</button>)}</div>
          <button type="button" onClick={() => { setAlbedo(0.3); setEps(0.78) }} className="rounded-lg border-2 px-3 py-1 text-sm hover:bg-muted">Reset to today’s Earth</button>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Without its natural greenhouse effect Earth would average about −18 °C, frozen solid. Water vapour, CO₂ and methane absorb outgoing infrared and send some back down, giving us about 15 °C. Adding more CO₂ traps more heat. Melting snow and ice lowers albedo, which warms Earth further: a <b>feedback loop</b>. (This is a simple model; real climate models include clouds, oceans and much more.)</p>
    </LabFrame>
  )
}
