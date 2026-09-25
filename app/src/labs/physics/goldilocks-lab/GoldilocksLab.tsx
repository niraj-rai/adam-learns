import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ATMOSPHERES, surfaceTempC, waterState } from './model'

export default function GoldilocksLab() {
  const [au, setAu] = useState(1)
  const [atm, setAtm] = useState('earth')
  const [albedo, setAlbedo] = useState(0.3)
  const g = ATMOSPHERES.find((a) => a.id === atm)!
  const t = surfaceTempC(au, albedo, g.greenhouse)
  const w = waterState(t)
  const planetFill = w === 'ice' ? '#e0f2fe' : w === 'steam' ? '#fdba74' : '#2563eb'
  const x = 40 + (Math.log(au / 0.3) / Math.log(3 / 0.3)) * 340
  const zx = (a: number) => 40 + (Math.log(a / 0.3) / Math.log(3 / 0.3)) * 340
  return (
    <LabFrame labId="goldilocks-lab" title="Goldilocks Planet Lab" subtitle="Not too hot, not too cold. What makes Earth just right for life?" howTo={<p>Move your planet closer to or further from its star, give it an atmosphere, and change how much sunlight it reflects (ice and clouds reflect more). Can you keep water liquid?</p>}>
      <svg viewBox="0 0 400 140" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Planet at ${au} AU with ${g.name}: ${t.toFixed(0)} °C, ${w}`}>
        <circle cx={0} cy={70} r={40} fill="#fbbf24" />
        <rect x={zx(0.95)} y={10} width={zx(1.4) - zx(0.95)} height={120} fill="#22c55e" opacity={0.15} />
        <text x={(zx(0.95) + zx(1.4)) / 2} y={24} fontSize={9} textAnchor="middle" fill="#86efac">Goldilocks zone</text>
        {[0.39, 0.72, 1, 1.52].map((a, i) => <text key={a} x={zx(a)} y={128} fontSize={8} textAnchor="middle" fill="#64748b">{['Mercury', 'Venus', 'Earth', 'Mars'][i]}</text>)}
        <circle cx={x} cy={70} r={16} fill={planetFill} stroke={g.greenhouse > 0 ? '#93c5fd' : 'none'} strokeWidth={Math.min(8, 1 + g.greenhouse / 40)} strokeOpacity={0.5} />
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <label className="block text-sm">Distance from the star: <b>{au.toFixed(2)} AU</b>
            <Slider value={[au]} min={0.3} max={3} step={0.01} onValueChange={([v]) => setAu(v)} className="mt-1.5" aria-label="Distance from the star" />
          </label>
          <label className="block text-sm">Sunlight reflected (albedo): <b>{Math.round(albedo * 100)}%</b>
            <Slider value={[albedo]} min={0.05} max={0.8} step={0.05} onValueChange={([v]) => setAlbedo(v)} className="mt-1.5" aria-label="Albedo" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ATMOSPHERES.map((a) => <button key={a.id} type="button" onClick={() => setAtm(a.id)} className={cn('rounded-full border px-2.5 py-1 text-xs', a.id === atm ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{a.name}</button>)}
          </div>
        </div>
        <div className="space-y-2">
          <Readout label="Average surface temperature" value={`${t.toFixed(0)} °C`} />
          <Readout label="Water would be" value={w === 'liquid water' ? '💧 liquid: life possible!' : w === 'ice' ? '🧊 frozen' : '♨️ boiled away'} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        Earth is at just the right distance from the Sun, and its atmosphere traps just enough heat (the natural <b>greenhouse effect</b> adds about 33 °C) for liquid water. It also has a magnetic field and an ozone layer that shield life from harmful radiation. Too much greenhouse gas, as on Venus, makes a planet unbearably hot, which is why climate change matters.
      </p>
    </LabFrame>
  )
}
