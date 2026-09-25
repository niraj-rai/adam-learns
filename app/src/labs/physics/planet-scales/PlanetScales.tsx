import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Surface gravity in N/kg (= m/s²). */
export const PLACES = [
  { id: 'moon', name: 'Moon', emoji: '🌕', g: 1.62, air: false },
  { id: 'mercury', name: 'Mercury', emoji: '☿️', g: 3.7, air: false },
  { id: 'mars', name: 'Mars', emoji: '🔴', g: 3.71, air: true },
  { id: 'venus', name: 'Venus', emoji: '🟡', g: 8.87, air: true },
  { id: 'earth', name: 'Earth', emoji: '🌍', g: 9.8, air: true },
  { id: 'jupiter', name: 'Jupiter', emoji: '🪐', g: 24.8, air: true },
]

export default function PlanetScales() {
  const [mass, setMass] = useState(40)
  const [pid, setPid] = useState('earth')
  const [drop, setDrop] = useState(0)
  const p = PLACES.find((x) => x.id === pid)!
  const weight = mass * p.g
  const scaleKg = weight / 9.8
  const hasAir = p.air
  const dropDur = Math.sqrt((2 * 2) / p.g) // falling 2 m

  return (
    <LabFrame
      labId="planet-scales"
      title="Planet Scales"
      subtitle="Your mass stays the same everywhere. Your weight doesn't!"
      howTo={<p>Set your mass, then travel to different worlds. Watch your weight (in newtons) change. Then drop a hammer and a feather together. Where do they land at the same time?</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {PLACES.map((x) => (
          <button key={x.id} type="button" onClick={() => { setPid(x.id); setDrop(0) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === pid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border bg-background p-4">
          <label className="block text-sm">Your mass: <b>{mass} kg</b>
            <Slider value={[mass]} min={10} max={100} step={1} onValueChange={([v]) => setMass(v)} className="mt-1.5" aria-label="Your mass" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Readout label="Mass (everywhere)" value={`${mass} kg`} />
            <Readout label={`Weight on ${p.name}`} value={`${weight.toFixed(0)} N`} />
            <Readout label="Gravity here" value={`${p.g} N/kg`} />
            <Readout label="Bathroom scale reads" value={`${scaleKg.toFixed(1)} kg`} />
          </div>
          <p className="text-sm text-muted-foreground">Weight = mass × gravity = {mass} × {p.g} = <b>{weight.toFixed(0)} N</b>. A bathroom scale is designed for Earth, so on {p.name} it would show {scaleKg.toFixed(1)} kg.</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <svg viewBox="0 0 200 160" className="w-full" role="img" aria-label={`Hammer and feather dropped on ${p.name}`}>
            <rect x={0} y={148} width={200} height={12} fill={pid === 'moon' ? '#d4d4d8' : pid === 'mars' ? '#c2410c' : '#a3e635'} />
            <motion.text key={`h${drop}`} x={70} fontSize={20} initial={{ y: 22 }} animate={{ y: drop ? 146 : 22 }} transition={{ duration: drop ? dropDur : 0, ease: 'easeIn' }}>🔨</motion.text>
            <motion.text key={`f${drop}`} x={120} fontSize={20} initial={{ y: 22, rotate: 0 }} animate={{ y: drop ? 146 : 22, rotate: drop && hasAir ? [0, 20, -20, 15, 0] : 0 }} transition={{ duration: drop ? (hasAir ? dropDur * 4 : dropDur) : 0, ease: hasAir ? 'linear' : 'easeIn' }}>🪶</motion.text>
          </svg>
          <Button className="mt-2 w-full" onClick={() => setDrop((d) => d + 1)}>Drop the hammer and feather</Button>
          {drop > 0 && (
            <p role="status" className="mt-2 text-sm">
              {hasAir ? `On ${p.name}, air pushes up on the light, wide feather (air resistance), so it falls slowly.` : `On the ${p.name}, there's no air, so both land together! Astronaut David Scott did exactly this on the Moon in 1971.`}
            </p>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
