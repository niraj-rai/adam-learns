import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Coefficient of friction μ: the block starts sliding when tan(angle) > μ. */
export const SURFACES = [
  { id: 'ice', name: 'Ice', emoji: '🧊', mu: 0.05, colour: '#bae6fd' },
  { id: 'glass', name: 'Glass', emoji: '🪟', mu: 0.2, colour: '#e0f2fe' },
  { id: 'wood', name: 'Polished wood', emoji: '🪵', mu: 0.35, colour: '#d6a268' },
  { id: 'carpet', name: 'Carpet', emoji: '🟫', mu: 0.6, colour: '#a16207' },
  { id: 'sandpaper', name: 'Sandpaper', emoji: '📜', mu: 0.8, colour: '#a8a29e' },
]

export const slipAngle = (mu: number) => (Math.atan(mu) * 180) / Math.PI

export default function FrictionRamp() {
  const [sid, setSid] = useState('wood')
  const [angle, setAngle] = useState(5)
  const [wheels, setWheels] = useState(false)
  const [log, setLog] = useState<Record<string, number>>({})
  const surf = SURFACES.find((s) => s.id === sid)!
  const mu = wheels ? 0.02 : surf.mu
  const slides = Math.tan((angle * Math.PI) / 180) > mu

  const rad = (angle * Math.PI) / 180
  const L = 300
  const x0 = 40
  const y0 = 190
  const x1 = x0 + L * Math.cos(rad)
  const y1 = y0 - L * Math.sin(rad)
  const pos = slides ? 0.1 : 0.8
  const bx = x0 + L * pos * Math.cos(rad)
  const by = y0 - L * pos * Math.sin(rad)

  const record = () => {
    setLog((l) => ({ ...l, [wheels ? 'wheels' : sid]: angle }))
    sfx.click()
  }

  return (
    <LabFrame
      labId="friction-ramp"
      title="Friction Ramp"
      subtitle="Tilt the ramp until the block starts to slide. Which surface grips best?"
      howTo={<p>Choose a surface, then slowly raise the angle. Record the angle when the block <b>just</b> starts to slide. More friction = a steeper angle is needed. Try putting the block on wheels!</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {SURFACES.map((s) => (
          <button key={s.id} type="button" onClick={() => { setSid(s.id); setAngle(5) }} className={cn('rounded-full border px-3 py-1.5 text-sm', s.id === sid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <svg viewBox="0 0 380 210" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Ramp of ${surf.name} at ${angle} degrees; block ${slides ? 'slides down' : 'stays still'}`}>
          <polygon points={`${x0},${y0} ${x1},${y1} ${x1},${y0}`} fill={surf.colour} stroke="#57534e" />
          <motion.g initial={false} animate={{ x: bx, y: by, rotate: -angle }} transition={slides ? { duration: 1.2, ease: 'easeIn' } : { duration: 0.2 }} style={{ originX: 0, originY: 0 }}>
            <rect x={-18} y={-26} width={36} height={24} rx={3} fill="#7c3aed" />
            {wheels && <><circle cx={-10} cy={0} r={4} fill="#111" /><circle cx={10} cy={0} r={4} fill="#111" /></>}
          </motion.g>
          <path d={`M ${x0 + 40} ${y0} A 40 40 0 0 0 ${x0 + 40 * Math.cos(rad)} ${y0 - 40 * Math.sin(rad)}`} fill="none" stroke="#dc2626" />
          <text x={x0 + 48} y={y0 - 6} fontSize={11} fill="#dc2626">{angle}°</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Ramp angle: <b>{angle}°</b>
            <Slider value={[angle]} min={0} max={45} step={1} onValueChange={([v]) => setAngle(v)} className="mt-1.5" aria-label="Ramp angle" />
          </label>
          <Button variant={wheels ? 'default' : 'outline'} className="w-full" onClick={() => setWheels((w) => !w)}>{wheels ? '🛞 On wheels (rolling)' : '🛞 Put the block on wheels'}</Button>
          <Readout label="Block" value={slides ? '⬇️ Sliding!' : '🛑 Staying still'} />
          <Button className="w-full" variant="outline" disabled={!slides} onClick={record}>📝 Record slip angle</Button>
        </div>
      </div>
      {Object.keys(log).length > 0 && (
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground uppercase"><tr><th>Surface</th><th>Slip angle (recorded)</th></tr></thead>
          <tbody>
            {Object.entries(log).map(([k, v]) => (
              <tr key={k} className="border-t"><td className="py-1">{k === 'wheels' ? '🛞 Block on wheels' : SURFACES.find((s) => s.id === k)!.name}</td><td>{v}°</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {Object.keys(log).length >= 3 && (
        <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm" role="status">
          📊 Rougher surfaces needed a steeper angle before the block slid: they have more <b>friction</b>. Wheels reduce friction enormously, because <b>rolling friction</b> is much smaller than <b>sliding friction</b>.
        </p>
      )}
    </LabFrame>
  )
}
