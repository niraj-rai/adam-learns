import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { G_EARTH } from '../_shared/dynamics'
import { kWh, potentialEnergy, power } from '../_shared/energy'

const APPLIANCES = [
  { id: 'led', name: 'LED bulb', emoji: '💡', watts: 9, hours: 6 },
  { id: 'fan', name: 'Ceiling fan', emoji: '🌀', watts: 75, hours: 10 },
  { id: 'tv', name: 'Television', emoji: '📺', watts: 100, hours: 3 },
  { id: 'fridge', name: 'Fridge (average)', emoji: '🧊', watts: 150, hours: 24 },
  { id: 'ac', name: 'Air conditioner', emoji: '❄️', watts: 1500, hours: 6 },
  { id: 'geyser', name: 'Water heater', emoji: '🚿', watts: 2000, hours: 0.5 },
]
const RATE = 7 // ₹ per unit (kWh): an example rate; real tariffs vary by state and slab

export default function PowerStairs() {
  const [m, setM] = useState(50)
  const [floors, setFloors] = useState(3)
  const [t, setT] = useState(20)
  const [hours, setHours] = useState<Record<string, number>>(Object.fromEntries(APPLIANCES.map((a) => [a.id, a.hours])))
  const h = floors * 3
  const E = potentialEnergy(m, h)
  const P = power(E, t)
  const daily = APPLIANCES.map((a) => ({ ...a, kwh: kWh(a.watts, hours[a.id]) }))
  const totalDay = daily.reduce((s, a) => s + a.kwh, 0)
  return (
    <LabFrame labId="power-stairs" title="Power Up" subtitle="Power is how fast energy is transferred: P = W ÷ t, measured in watts." howTo={<p>Race up the stairs: set your mass, the number of floors and your time. Then plan a home's electricity use and see the monthly bill.</p>}>
      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <svg viewBox="0 0 160 170" className="mx-auto w-full max-w-[160px]" role="img" aria-label={`${floors} floors of stairs`}>
          {Array.from({ length: floors * 3 }, (_, i) => <rect key={i} x={10 + i * (140 / (floors * 3))} y={160 - (i + 1) * (150 / (floors * 3))} width={140 / (floors * 3) + 1} height={(i + 1) * (150 / (floors * 3))} fill="#94a3b8" opacity={0.5} />)}
          <text x={140} y={20} fontSize={22} textAnchor="middle">🏃</text>
          <text x={10} y={168} fontSize={9} fill="currentColor">{h} m high</text>
        </svg>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Your mass <b>{m} kg</b><Slider value={[m]} min={25} max={90} step={5} onValueChange={([v]) => setM(v)} className="mt-1" aria-label="mass" /></label>
            <label className="text-sm">Floors <b>{floors}</b> (3 m each)<Slider value={[floors]} min={1} max={10} step={1} onValueChange={([v]) => setFloors(v)} className="mt-1" aria-label="floors" /></label>
            <label className="text-sm">Time <b>{t} s</b><Slider value={[t]} min={5} max={120} step={1} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="time" /></label>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Work done = mgh" value={`${m} × ${G_EARTH} × ${h} = ${E.toFixed(0)} J`} />
            <Readout label="Power = W ÷ t" value={`${P.toFixed(0)} W`} />
            <Readout label="Same as" value={`${(P / 9).toFixed(0)} LED bulbs 💡`} />
          </div>
          <p className="text-sm text-muted-foreground">Run up in half the time and you do the <b>same work</b> but with <b>double the power</b>. A fit person can manage a few hundred watts for a short burst.</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border p-3">
        <p className="font-heading text-lg font-semibold">🧾 Electricity bill planner</p>
        <p className="text-sm text-muted-foreground">Your bill counts <b>units</b>: 1 unit = 1 kilowatt-hour (kWh) = 1000 W for 1 hour = 3.6 million joules.</p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="p-1">Appliance</th><th className="p-1">Power</th><th className="p-1">Hours a day</th><th className="p-1 text-right">kWh a day</th></tr></thead>
            <tbody>
              {daily.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="p-1">{a.emoji} {a.name}</td>
                  <td className="p-1 font-mono">{a.watts} W</td>
                  <td className="p-1"><div className="flex items-center gap-2"><Slider value={[hours[a.id]]} min={0} max={24} step={0.5} onValueChange={([v]) => setHours((x) => ({ ...x, [a.id]: v }))} className="w-28" aria-label={`${a.name} hours`} /><span className="w-10 font-mono">{hours[a.id]}</span></div></td>
                  <td className="p-1 text-right font-mono">{a.kwh.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Readout label="Units per day" value={`${totalDay.toFixed(1)} kWh`} />
          <Readout label="Units per month (30 days)" value={`${(totalDay * 30).toFixed(0)} kWh`} />
          <Readout label={`Bill at ₹${RATE}/unit (example rate)`} value={`₹${Math.round(totalDay * 30 * RATE).toLocaleString('en-IN')}`} />
        </div>
      </div>
    </LabFrame>
  )
}
