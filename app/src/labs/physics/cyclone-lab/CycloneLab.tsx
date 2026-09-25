import { motion } from 'motion/react'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** India Meteorological Department (IMD) categories by maximum sustained wind speed (km/h). */
export const IMD = [
  { max: 30, name: 'Low pressure area (no storm yet)' },
  { max: 49, name: 'Depression' },
  { max: 61, name: 'Deep depression' },
  { max: 88, name: 'Cyclonic storm' },
  { max: 117, name: 'Severe cyclonic storm' },
  { max: 165, name: 'Very severe cyclonic storm' },
  { max: 221, name: 'Extremely severe cyclonic storm' },
  { max: Infinity, name: 'Super cyclonic storm' },
]
export const categoryFor = (wind: number) => IMD.find((c) => wind <= c.max)!.name

/** A simple teaching model: warm seas (above ~26.5 °C) feed rising air, lower pressure and faster winds. */
export function cycloneModel(seaTemp: number, days: number) {
  const fuel = Math.max(0, seaTemp - 26.5)
  const wind = Math.min(280, 20 + fuel * days * 11)
  const pressure = Math.round(1012 - (wind - 20) * 0.45)
  return { wind: Math.round(wind), pressure }
}

export default function CycloneLab() {
  const [tab, setTab] = useState<'breeze' | 'cyclone'>('breeze')
  const [day, setDay] = useState(true)
  const [sea, setSea] = useState(29)
  const [days, setDays] = useState(3)
  const m = cycloneModel(sea, days)
  const cat = categoryFor(m.wind)

  return (
    <LabFrame labId="cyclone-lab" title="Winds, Storms and Cyclones" subtitle="Air moves from high pressure to low pressure. Warm oceans can turn that into a cyclone." howTo={<p>Tab 1: switch between day and night at the seaside. Which way does the breeze blow? Tab 2: warm the Bay of Bengal and let the storm grow for a few days.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['breeze', '🏖️ Sea & land breezes'], ['cyclone', '🌀 Cyclone builder']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>

      {tab === 'breeze' ? (
        <div className="space-y-3">
          <svg viewBox="0 0 400 180" className={cn('w-full rounded-2xl border', day ? 'bg-sky-100' : 'bg-slate-800')} role="img" aria-label={day ? 'Daytime sea breeze blowing from sea to land' : 'Night-time land breeze blowing from land to sea'}>
            <text x={day ? 330 : 60} y={34} fontSize={26}>{day ? '☀️' : '🌙'}</text>
            <rect x={0} y={120} width={200} height={60} fill="#38bdf8" />
            <rect x={200} y={110} width={200} height={70} fill="#a16207" />
            <text x={100} y={160} textAnchor="middle" fontSize={11} fill="#fff">sea: {day ? 'cooler' : 'warmer'}</text>
            <text x={300} y={160} textAnchor="middle" fontSize={11} fill="#fff">land: {day ? 'hotter' : 'cooler'}</text>
            {/* surface wind */}
            {[0, 1, 2].map((i) => (
              <motion.text key={i} y={100} fontSize={20} animate={{ x: day ? [40 + i * 50, 240 + i * 40] : [340 - i * 50, 140 - i * 40] }} transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.6, ease: 'linear' }}>💨</motion.text>
            ))}
            <text x={day ? 300 : 100} y={70} textAnchor="middle" fontSize={11} fill={day ? '#1e293b' : '#e2e8f0'}>⬆ warm air rises: LOW pressure</text>
          </svg>
          <div className="flex gap-2">
            <button type="button" onClick={() => setDay(true)} className={cn('rounded-full border px-3 py-1.5 text-sm', day ? 'border-chem bg-chem-soft font-semibold' : '')}>☀️ Day</button>
            <button type="button" onClick={() => setDay(false)} className={cn('rounded-full border px-3 py-1.5 text-sm', !day ? 'border-chem bg-chem-soft font-semibold' : '')}>🌙 Night</button>
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm" role="status">
            {day ? '☀️ By day, land heats up faster than the sea. Warm air rises over the land (low pressure), and cooler air from the sea rushes in: a SEA BREEZE.' : '🌙 At night, land cools faster than the sea. Now the air over the sea is warmer and rises, so air flows from land to sea: a LAND BREEZE.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_280px]">
          <div className="grid aspect-square max-h-72 place-items-center overflow-hidden rounded-2xl border bg-sky-700">
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: Math.max(1.5, 12 - m.wind / 25), ease: 'linear' }} className="relative" style={{ width: `${40 + Math.min(200, m.wind)}px`, height: `${40 + Math.min(200, m.wind)}px` }}>
              <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from 0deg, rgba(255,255,255,${Math.min(0.9, m.wind / 200)}), transparent 30%, rgba(255,255,255,${Math.min(0.8, m.wind / 220)}) 50%, transparent 80%)` }} />
              {m.wind > 118 && <div className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-700" title="the eye" />}
            </motion.div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm">Sea surface temperature: <b>{sea} °C</b>
              <Slider value={[sea]} min={24} max={32} step={0.5} onValueChange={([v]) => setSea(v)} className="mt-1.5" aria-label="Sea surface temperature" />
            </label>
            <label className="block text-sm">Days over warm sea: <b>{days}</b>
              <Slider value={[days]} min={0} max={7} step={1} onValueChange={([v]) => setDays(v)} className="mt-1.5" aria-label="Days over warm sea" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Readout label="Centre pressure" value={`${m.pressure} hPa`} />
              <Readout label="Wind speed" value={`${m.wind} km/h`} />
            </div>
            <p className="rounded-lg bg-chem-soft p-3 text-sm" role="status"><b>IMD category:</b> {cat}. {sea < 26.5 ? 'The sea is too cool to fuel a cyclone.' : 'Warm, moist air rises, the pressure at the centre falls, and air rushes in and spirals faster.'}</p>
          </div>
        </div>
      )}
    </LabFrame>
  )
}
