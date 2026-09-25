import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { shadowLength, sunPosition } from './model'

const LAT = 12.97 // Bengaluru
const fmt = (h: number) => `${String(Math.floor(h) % 24).padStart(2, '0')}:${String(Math.round((h % 1) * 60) % 60).padStart(2, '0')}`

export default function DayNight() {
  const [hour, setHour] = useState(9)
  const [tab, setTab] = useState<'space' | 'sundial'>('space')
  const sun = sunPosition(LAT, 0, hour)
  const day = sun.alt > 0
  return (
    <LabFrame labId="day-night" title="Day, Night and the Moving Sun" subtitle="The Sun doesn't move across the sky. The Earth spins!" howTo={<p>Slide the time of day. Tab 1 shows the spinning Earth from space, looking down on the North Pole, with Bengaluru marked. Tab 2 shows the shadow of a stick (a gnomon) in a Bengaluru school ground on an equinox day.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['space', '🌍 From space'], ['sundial', '🕰️ Shadow stick']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'space' ? <Space hour={hour} day={day} /> : <Sundial hour={hour} />}
      <label className="mt-3 block text-sm">Time in Bengaluru: <b>{fmt(hour)}</b>
        <Slider value={[hour]} min={0} max={23.75} step={0.25} onValueChange={([v]) => setHour(v)} className="mt-1.5" aria-label="Time of day" />
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Readout label="Bengaluru is in" value={day ? '☀️ daytime' : '🌙 night-time'} />
        <Readout label="Sun’s height" value={day ? `${sun.alt.toFixed(0)}° above the horizon` : 'below the horizon'} />
        <Readout label="Sun’s direction" value={day ? (sun.az < 180 ? 'eastern sky' : 'western sky') : '–'} />
      </div>
    </LabFrame>
  )
}

function Space({ hour, day }: { hour: number; day: boolean }) {
  // Looking down on the North Pole, Earth spins anticlockwise. Sunlight comes from the left.
  // At noon Bengaluru faces the Sun (left); at midnight it faces away (right).
  const angle = 180 + (hour - 12) * 15 // degrees, maths convention (anticlockwise from +x)
  const r = 70
  const bx = 200 + r * Math.cos((angle * Math.PI) / 180)
  const by = 110 - r * Math.sin((angle * Math.PI) / 180)
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 400 220" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Earth from above the North Pole at ${fmt(hour)}: Bengaluru is on the ${day ? 'day' : 'night'} side`}>
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} y1={40 + i * 28} x2={110} y2={40 + i * 28} stroke="#fde68a" strokeOpacity={0.5} strokeDasharray="6 6" />)}
        <text x={8} y={24} fontSize={11} fill="#fde68a">sunlight →</text>
        <circle cx={200} cy={110} r={r} fill="#1d4ed8" />
        <path d={`M200 ${110 - r} A ${r} ${r} 0 0 1 200 ${110 + r} Z`} fill="#020617" opacity={0.75} />
        <circle cx={200} cy={110} r={4} fill="#e2e8f0" />
        <text x={206} y={106} fontSize={9} fill="#e2e8f0">N pole</text>
        <circle cx={bx} cy={by} r={6} fill="#f97316" stroke="#fff" />
        <text x={bx + 8} y={by + 4} fontSize={10} fill="#fff">Bengaluru</text>
        <path d="M290 60 a 40 40 0 0 0 -30 -25" fill="none" stroke="#94a3b8" markerEnd="url(#arr)" />
        <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" /></marker></defs>
        <text x={300} y={52} fontSize={10} fill="#94a3b8">spins west → east</text>
      </svg>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The Earth <b>rotates</b> on its axis once every 24 hours, from west to east. The half facing the Sun has day; the other half has night. As Bengaluru turns into the sunlight, the Sun seems to rise in the <b>east</b>; as it turns away, the Sun seems to set in the <b>west</b>.</p>
    </div>
  )
}

function Sundial({ hour }: { hour: number }) {
  const sun = sunPosition(LAT, 0, hour)
  const len = shadowLength(40, sun.alt)
  // Shadow points away from the Sun: azimuth + 180°. Draw on a map with north up.
  const shadowAz = ((sun.az + 180) * Math.PI) / 180
  const L = Math.min(150, len)
  const ex = 200 + L * Math.sin(shadowAz)
  const ey = 115 - L * Math.cos(shadowAz)
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 400 230" className="w-full rounded-2xl border bg-lime-50 dark:bg-slate-900" role="img" aria-label={sun.alt > 0 ? `Shadow ${len.toFixed(0)} units long pointing ${sun.az < 180 ? 'west' : 'east'}` : 'No shadow: night'}>
        <text x={200} y={16} fontSize={11} textAnchor="middle" className="fill-foreground">N</text>
        <text x={200} y={226} fontSize={11} textAnchor="middle" className="fill-foreground">S</text>
        <text x={388} y={119} fontSize={11} textAnchor="middle" className="fill-foreground">E</text>
        <text x={12} y={119} fontSize={11} textAnchor="middle" className="fill-foreground">W</text>
        {[6, 8, 10, 12, 14, 16, 18].map((h) => {
          const s = sunPosition(LAT, 0, h)
          const a = ((s.az + 180) * Math.PI) / 180
          const l = Math.min(150, shadowLength(40, Math.max(1, s.alt)))
          return <text key={h} x={200 + (l + 10) * Math.sin(a)} y={119 - (l + 10) * Math.cos(a)} fontSize={9} textAnchor="middle" className="fill-muted-foreground">{h}</text>
        })}
        {sun.alt > 0 && <line x1={200} y1={115} x2={ex} y2={ey} stroke="#334155" strokeWidth={6} strokeLinecap="round" opacity={0.7} />}
        <circle cx={200} cy={115} r={5} fill="#a16207" />
      </svg>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">{sun.alt <= 0 ? 'Night: no Sun, no shadow.' : `Shadows point away from the Sun: west in the morning, east in the afternoon. They are long when the Sun is low and shortest at noon. A sundial uses this to tell the time. On two days a year (late April and mid-August), the noon Sun is directly overhead in Bengaluru, and your shadow disappears: Zero Shadow Day!`}</p>
    </div>
  )
}
