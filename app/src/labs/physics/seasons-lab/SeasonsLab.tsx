import { useMemo, useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { dayLength, dayOf21st, declination, MONTHS, noonAltitude, PLACES } from './model'

/** Dark half of a planet of radius r, facing away from the Sun, which lies in direction `toSun` (radians, screen coordinates). */
const nightHalf = (toSun: number, r: number) => {
  const a = toSun + Math.PI / 2
  const b = toSun - Math.PI / 2
  return `M${r * Math.cos(a)} ${r * Math.sin(a)} A ${r} ${r} 0 0 1 ${r * Math.cos(b)} ${r * Math.sin(b)} Z`
}

const hm = (h: number) => `${Math.floor(h)} h ${String(Math.round((h % 1) * 60)).padStart(2, '0')} min`

export default function SeasonsLab() {
  const [m, setM] = useState(5)
  const [pid, setPid] = useState('del')
  const place = PLACES.find((p) => p.id === pid)!
  const n = dayOf21st(m)
  const dl = dayLength(place.lat, n)
  const alt = noonAltitude(place.lat, n)
  const dec = declination(n)
  const data = useMemo(() => MONTHS.map((mm, i) => ({ month: mm, [place.name]: +dayLength(place.lat, dayOf21st(i)).toFixed(2), Bengaluru: +dayLength(12.97, dayOf21st(i)).toFixed(2) })), [place])

  // orbit: June at the right (Earth's north pole tilted towards the Sun), December at the left
  const orbitAngle = ((m - 5) / 12) * 2 * Math.PI
  const ex = 200 + 150 * Math.cos(orbitAngle)
  const ey = 100 + 60 * Math.sin(orbitAngle)
  const northTowardsSun = dec > 5
  const southTowardsSun = dec < -5
  const summerNorth = place.lat >= 0 ? northTowardsSun : southTowardsSun
  const winterNorth = place.lat >= 0 ? southTowardsSun : northTowardsSun

  return (
    <LabFrame labId="seasons-lab" title="Seasons Lab" subtitle="Why is Delhi hot in June and cold in December? It's the tilt, not the distance!" howTo={<p>Choose a month and a place. Watch Earth move round the Sun with its axis always tilted the same way. Compare the day length and the height of the noon Sun.</p>}>
      <svg viewBox="0 0 400 200" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Earth in ${MONTHS[m]}: the ${northTowardsSun ? 'northern' : southTowardsSun ? 'southern' : 'neither'} hemisphere tilted towards the Sun`}>
        <ellipse cx={200} cy={100} rx={150} ry={60} fill="none" stroke="#334155" strokeDasharray="4 4" />
        <circle cx={200} cy={100} r={18} fill="#fbbf24" />
        {MONTHS.map((mm, i) => {
          const a = ((i - 5) / 12) * 2 * Math.PI
          return <text key={mm} x={200 + 172 * Math.cos(a)} y={104 + 78 * Math.sin(a)} fontSize={8} textAnchor="middle" fill={i === m ? '#fde68a' : '#475569'}>{mm}</text>
        })}
        <g transform={`translate(${ex} ${ey})`}>
          <circle r={14} fill="#2563eb" />
          <path d={nightHalf(Math.atan2(100 - ey, 200 - ex), 14)} fill="#020617" opacity={0.7} />
          {/* the axis always leans the same way in space: towards the Sun in June (Earth on the right) */}
          <line x1={-9} y1={-20} x2={9} y2={20} stroke="#e2e8f0" strokeWidth={1.5} />
          <text x={-12} y={-22} fontSize={8} fill="#e2e8f0">N</text>
        </g>
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <label className="block text-sm">Month: <b>{MONTHS[m]} (the 21st)</b>
            <Slider value={[m]} min={0} max={11} step={1} onValueChange={([v]) => setM(v)} className="mt-1.5" aria-label="Month" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PLACES.map((p) => <button key={p.id} type="button" onClick={() => setPid(p.id)} className={cn('rounded-full border px-2.5 py-1 text-xs', p.id === pid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.name}</button>)}
          </div>
          <div className="h-52 rounded-xl border p-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 24]} ticks={[0, 6, 12, 18, 24]} tick={{ fontSize: 10 }} width={30} />
                <Tooltip formatter={(v) => `${v} h`} />
                <Legend verticalAlign="top" height={20} wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine x={MONTHS[m]} stroke="#f59e0b" />
                <Line dataKey={place.name} stroke="#ef4444" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                {place.name !== 'Bengaluru' && <Line dataKey="Bengaluru" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="space-y-2">
          <Readout label={`Daylight in ${place.name}`} value={dl >= 24 ? '24 h (midnight Sun!)' : dl <= 0 ? '0 h (polar night!)' : hm(dl)} />
          <Readout label="Noon Sun height" value={alt > 0 ? `${alt.toFixed(0)}° above the horizon` : 'below the horizon'} />
          <Readout label="Season (roughly)" value={Math.abs(place.lat) < 10 ? 'little change near the equator' : summerNorth ? 'summer ☀️' : winterNorth ? 'winter ❄️' : 'spring/autumn'} />
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        Earth's axis is tilted by about <b>23.5°</b> and always points the same way in space. In June, the northern half leans towards the Sun: the Sun climbs higher, its rays hit more directly, and days are longer, so it's summer in India. In December, the northern half leans away. Earth is actually <b>closest</b> to the Sun in early January, so distance is not the cause!
      </p>
    </LabFrame>
  )
}
