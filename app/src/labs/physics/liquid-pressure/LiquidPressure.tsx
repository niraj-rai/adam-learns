import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const LIQUIDS = [
  { id: 'water', name: 'Water', density: 1000, colour: '#38bdf8' },
  { id: 'oil', name: 'Cooking oil', density: 920, colour: '#facc15' },
  { id: 'honey', name: 'Honey', density: 1420, colour: '#d97706' },
]
const G = 9.8
const HOLES = [0.25, 0.5, 0.75] // fraction of the tank height from the top of a full tank

/** Pressure (Pa) due to a liquid column of depth h metres: P = ρ g h. */
export const liquidPressure = (density: number, depthM: number) => density * G * depthM

export default function LiquidPressure() {
  const [tab, setTab] = useState<'tank' | 'air'>('tank')
  const [level, setLevel] = useState(100) // cm of liquid
  const [lid, setLid] = useState('water')
  const [open, setOpen] = useState(false)
  const [can, setCan] = useState<'full' | 'heated' | 'crushed'>('full')
  const l = LIQUIDS.find((x) => x.id === lid)!

  const tankH = 160
  const surface = 20 + tankH * (1 - level / 100)

  return (
    <LabFrame labId="liquid-pressure" title="Pressure in Liquids and Air" subtitle="Deeper = more pressure. And the air above us presses too!" howTo={<p>Tab 1: open the three holes in the tank and compare the jets. Change the water level and the liquid. Tab 2: see what the air around us can do to a can.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['tank', '💧 Liquid pressure'], ['air', '🌬️ Air pressure']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>

      {tab === 'tank' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 360 200" className="w-full rounded-2xl border bg-background" role="img" aria-label="Tank of liquid with three holes at different depths">
            <rect x={40} y={surface} width={90} height={180 - surface} fill={l.colour} opacity={0.6} />
            <path d="M40 20 V180 H130 V20" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={3} />
            {HOLES.map((f, i) => {
              const y = 20 + tankH * f
              const depthCm = Math.max(0, y - surface) * (100 / tankH)
              const v = Math.sqrt(2 * G * (depthCm / 100)) // Torricelli
              const reach = v * 55
              return (
                <g key={i}>
                  <circle cx={131} cy={y} r={3} fill="#111" />
                  {open && depthCm > 0 && (
                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} d={`M 132 ${y} Q ${132 + reach * 0.6} ${y} ${132 + reach} ${Math.min(190, y + (180 - y) * 0.95)}`} fill="none" stroke={l.colour} strokeWidth={4} strokeLinecap="round" />
                  )}
                  <text x={20} y={y + 4} fontSize={10} textAnchor="middle" className="fill-muted-foreground">{depthCm.toFixed(0)} cm</text>
                </g>
              )
            })}
            <rect x={0} y={190} width={360} height={10} fill="#d6d3d1" />
          </svg>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {LIQUIDS.map((x) => (
                <button key={x.id} type="button" onClick={() => setLid(x.id)} className={cn('rounded-full border px-2.5 py-1 text-xs', x.id === lid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>
              ))}
            </div>
            <label className="block text-sm">Liquid level: <b>{level} cm</b>
              <Slider value={[level]} min={20} max={100} step={5} onValueChange={([v]) => setLevel(v)} className="mt-1.5" aria-label="Liquid level" />
            </label>
            <Button className="w-full" variant={open ? 'default' : 'outline'} onClick={() => setOpen((o) => !o)}>{open ? '🔒 Close holes' : '🔓 Open the holes'}</Button>
            <Readout label="Pressure at the bottom hole" value={`${(liquidPressure(l.density, Math.max(0, (20 + tankH * 0.75 - surface) * (100 / tankH)) / 100) / 1000).toFixed(1)} kPa`} />
            <p className="rounded-lg bg-chem-soft p-3 text-sm">The <b>lowest</b> hole squirts <b>furthest</b>: pressure increases with depth. That's why dam walls are much thicker at the bottom!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <svg viewBox="0 0 300 180" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Metal can: ${can}`}>
            <motion.rect x={110} width={80} rx={6} fill="#94a3b8" stroke="#475569" animate={can === 'crushed' ? { y: 90, height: 60, scaleX: 0.7 } : { y: 40, height: 110, scaleX: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }} style={{ originX: '150px' }} />
            {can === 'heated' && <text x={150} y={32} textAnchor="middle" fontSize={20}>♨️</text>}
            {can === 'crushed' && Array.from({ length: 8 }, (_, i) => <text key={i} x={60 + i * 25} y={i % 2 ? 60 : 170} fontSize={12}>→</text>)}
            <rect x={0} y={155} width={300} height={25} fill="#7dd3fc" opacity={can === 'crushed' ? 0.8 : 0.3} />
          </svg>
          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => setCan('heated')}>1. Boil a little water in the can (steam pushes air out)</Button>
            <Button className="w-full" variant="outline" disabled={can !== 'heated'} onClick={() => setCan('crushed')}>2. Seal it and plunge it into cold water</Button>
            <Button className="w-full" variant="ghost" onClick={() => setCan('full')}>Reset</Button>
            {can === 'crushed' && <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">💥 Crunch! The steam inside condensed, leaving very little air inside. The air OUTSIDE pushes on the can with a huge pressure (about 10 N on every cm²!) and crushes it. <b>Atmospheric pressure</b> is all around us.</p>}
          </div>
        </div>
      )}
    </LabFrame>
  )
}
