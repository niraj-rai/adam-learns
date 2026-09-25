import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { MoonDisc } from './MoonDisc'
import { eclipse, illuminated, paksha, phaseName, SYNODIC } from './model'

/** Top view: Sun far to the left, Earth in the middle, Moon orbiting anticlockwise. Day 0 = new moon (Moon between Earth and Sun). */
export function OrbitView({ day, node = false, eclipseKind = null }: { day: number; node?: boolean; eclipseKind?: 'solar' | 'lunar' | null }) {
  const theta = (day / SYNODIC) * 2 * Math.PI
  const R = 70
  const mx = 220 + R * Math.cos(Math.PI + theta)
  const my = 110 + R * Math.sin(Math.PI + theta) * -1
  const toSun = Math.atan2(0, -1) // the Sun is to the left of everything
  const a = toSun + Math.PI / 2
  const b = toSun - Math.PI / 2
  const half = (r: number) => `M${r * Math.cos(a)} ${r * Math.sin(a)} A ${r} ${r} 0 0 1 ${r * Math.cos(b)} ${r * Math.sin(b)} Z`
  return (
    <svg viewBox="0 0 400 220" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Moon ${day.toFixed(1)} days after new moon`}>
      {Array.from({ length: 7 }, (_, i) => <line key={i} x1={0} y1={20 + i * 30} x2={60} y2={20 + i * 30} stroke="#fde68a" strokeOpacity={0.45} strokeDasharray="6 6" />)}
      <text x={6} y={14} fontSize={10} fill="#fde68a">sunlight →</text>
      <circle cx={220} cy={110} r={R} fill="none" stroke="#334155" strokeDasharray="3 4" />
      <g transform="translate(220 110)">
        <circle r={20} fill="#2563eb" />
        <path d={half(20)} fill="#020617" opacity={0.7} />
      </g>
      {eclipseKind === 'lunar' && <polygon points="220,90 400,100 400,120 220,130" fill="#020617" opacity={0.6} />}
      <g transform={`translate(${mx} ${my})`}>
        <circle r={9} fill={eclipseKind === 'lunar' ? '#b45309' : '#e2e8f0'} />
        <path d={half(9)} fill="#020617" opacity={eclipseKind === 'lunar' ? 0 : 0.8} />
        {node && <circle r={13} fill="none" stroke="#a78bfa" strokeDasharray="2 2" />}
      </g>
      {eclipseKind === 'solar' && <polygon points={`${mx},${my - 4} 220,${110 - 3} 220,${110 + 3} ${mx},${my + 4}`} fill="#020617" opacity={0.9} />}
      <text x={220} y={206} fontSize={10} textAnchor="middle" fill="#94a3b8">view from above the North Pole</text>
    </svg>
  )
}

export default function MoonLab() {
  const [tab, setTab] = useState<'phases' | 'eclipse'>('phases')
  const [day, setDay] = useState(4)
  const [node, setNode] = useState(20)
  const name = phaseName(day)
  const rise = (6 + (day * 24) / SYNODIC) % 24
  const ecl = eclipse(day, node)
  return (
    <LabFrame labId="moon-lab" title="Moon Lab" subtitle="The Moon is always half lit by the Sun. How much of that lit half we see changes through the month." howTo={<p>Tab 1: slide through a lunar month. On the left, watch the Moon orbit Earth from above. On the right, see the Moon as it looks from India. Tab 2: find out why we don't get an eclipse every month.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['phases', '🌓 Phases'], ['eclipse', '🌑 Eclipses']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <OrbitView day={day} node={tab === 'eclipse' && Math.abs(node) <= 10} eclipseKind={tab === 'eclipse' ? ecl : null} />
        <div className="grid place-items-center gap-2 rounded-2xl border bg-slate-950 p-3">
          <MoonDisc day={day} label={`${name}, ${(illuminated(day) * 100).toFixed(0)}% lit`} />
          <p className="text-center text-sm font-semibold text-slate-100">{name}</p>
        </div>
      </div>
      <label className="mt-3 block text-sm">Days since new moon (Amavasya): <b>{day.toFixed(1)}</b>
        <Slider value={[day]} min={0} max={29.5} step={0.25} onValueChange={([v]) => setDay(v)} className="mt-1.5" aria-label="Days since new moon" />
      </label>
      {tab === 'phases' ? (
        <>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Readout label="Phase" value={name} />
            <Readout label="Face lit" value={`${(illuminated(day) * 100).toFixed(0)}%`} />
            <Readout label="Rises at about" value={`${Math.floor(rise)}:${String(Math.round((rise % 1) * 60)).padStart(2, '0')}`} />
            <Readout label="Paksha" value={paksha(day).split(':')[0]} />
          </div>
          <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">The Sun always lights half of the Moon. As the Moon orbits Earth every 29.5 days, we see more or less of that lit half. From Amavasya (new moon) the lit part grows (<b>waxing</b>, Shukla paksha) to Purnima (full moon), then shrinks (<b>waning</b>, Krishna paksha). The Moon also rises about 50 minutes later each day.</p>
        </>
      ) : (
        <>
          <label className="mt-3 block text-sm">How far the Moon is above or below Earth's orbital plane at this point: <b>{node === 0 ? 'right on it' : `${Math.abs(node)}° ${node > 0 ? 'above' : 'below'}`}</b>
            <Slider value={[node]} min={-30} max={30} step={2} onValueChange={([v]) => setNode(v)} className="mt-1.5" aria-label="Moon's position relative to the orbital plane" />
          </label>
          <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', ecl ? 'bg-warn-soft' : 'bg-chem-soft')}>
            {ecl === 'solar' ? '🌑 SOLAR ECLIPSE! A new moon is exactly between the Sun and Earth, and its shadow falls on Earth. Never look at the Sun directly; use certified eclipse glasses.' : ecl === 'lunar' ? '🔴 LUNAR ECLIPSE! A full moon passes into Earth’s shadow and turns a coppery red. Safe to watch with your eyes.' : 'No eclipse. The Moon’s orbit is tilted by about 5°, so at most new and full moons the Moon passes just above or below the Sun–Earth line. An eclipse needs a new or full moon AND the Moon close to Earth’s orbital plane (near a “node”).'}
          </p>
        </>
      )}
    </LabFrame>
  )
}
