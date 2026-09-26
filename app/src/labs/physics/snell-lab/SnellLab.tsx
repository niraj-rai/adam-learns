import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { MEDIA, criticalAngle, refract } from '../_shared/optics'

const C = 3e8
const rad = (d: number) => (d * Math.PI) / 180

export default function SnellLab() {
  const [top, setTop] = useState<string>('air')
  const [bottom, setBottom] = useState<string>('glass')
  const [i, setI] = useState(40)
  const n1 = MEDIA.find((m) => m.id === top)!.n
  const n2 = MEDIA.find((m) => m.id === bottom)!.n
  const r = refract(n1, n2, i)
  const crit = criticalAngle(n1, n2)
  const O = { x: 200, y: 140 }
  const L = 120
  const inc = { x: O.x - L * Math.sin(rad(i)), y: O.y - L * Math.cos(rad(i)) }
  const out = r === null ? { x: O.x + L * Math.sin(rad(i)), y: O.y - L * Math.cos(rad(i)) } : { x: O.x + L * Math.sin(rad(r)), y: O.y + L * Math.cos(rad(r)) }
  const refl = { x: O.x + L * Math.sin(rad(i)), y: O.y - L * Math.cos(rad(i)) }
  const Pick = ({ value, set, label }: { value: string; set: (v: string) => void; label: string }) => (
    <div><p className="text-xs font-semibold text-muted-foreground uppercase">{label}</p><div className="mt-1 flex flex-wrap gap-1">{MEDIA.map((m) => <button key={m.id} type="button" aria-pressed={value === m.id} onClick={() => set(m.id)} className={cn('rounded-lg border-2 px-2 py-0.5 text-xs', value === m.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{m.name} ({m.n})</button>)}</div></div>
  )
  return (
    <LabFrame labId="snell-lab" title="Refraction and Snell's Law" subtitle="Light bends when it changes speed at a boundary. n₁ sin i = n₂ sin r tells you exactly how much." howTo={<p>Choose the two materials and the angle of incidence. Going from a denser to a less dense material, find the critical angle and watch total internal reflection.</p>}>
      <div className="grid gap-3 sm:grid-cols-2"><Pick value={top} set={setTop} label="Light starts in" /><Pick value={bottom} set={setBottom} label="…and enters" /></div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 400 280" className="w-full rounded-2xl border bg-background" role="img" aria-label={r === null ? 'Total internal reflection' : `Refracted at ${r.toFixed(1)} degrees`}>
          <rect x={0} y={0} width={400} height={140} fill="#e0f2fe" opacity={0.25 + (n1 - 1) * 0.4} />
          <rect x={0} y={140} width={400} height={140} fill="#0ea5e9" opacity={0.1 + (n2 - 1) * 0.35} />
          <line x1={O.x} y1={10} x2={O.x} y2={270} stroke="currentColor" strokeDasharray="5 4" strokeOpacity={0.5} />
          <text x={O.x + 4} y={20} fontSize={10} fill="currentColor" opacity={0.7}>normal</text>
          <line x1={inc.x} y1={inc.y} x2={O.x} y2={O.y} stroke="#f59e0b" strokeWidth={3} />
          <line x1={O.x} y1={O.y} x2={refl.x} y2={refl.y} stroke="#f59e0b" strokeWidth={r === null ? 3 : 1} strokeOpacity={r === null ? 1 : 0.3} />
          {r !== null && <line x1={O.x} y1={O.y} x2={out.x} y2={out.y} stroke="#dc2626" strokeWidth={3} />}
          <text x={O.x - 40} y={O.y - 40} fontSize={11} fill="#f59e0b">i = {i}°</text>
          {r !== null && <text x={O.x + 12} y={O.y + 50} fontSize={11} fill="#dc2626">r = {r.toFixed(1)}°</text>}
          <text x={8} y={132} fontSize={10} fill="currentColor">{MEDIA.find((m) => m.id === top)!.name}</text>
          <text x={8} y={154} fontSize={10} fill="currentColor">{MEDIA.find((m) => m.id === bottom)!.name}</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Angle of incidence i = <b>{i}°</b><Slider value={[i]} min={0} max={89} step={1} onValueChange={([v]) => setI(v)} className="mt-1" aria-label="angle of incidence" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Angle of refraction r" value={r === null ? 'None: total internal reflection' : `${r.toFixed(1)}°`} />
            <Readout label="n₁ sin i = n₂ sin r" value={r === null ? '—' : `${(n1 * Math.sin(rad(i))).toFixed(3)} = ${(n2 * Math.sin(rad(r))).toFixed(3)}`} />
            <Readout label="Speed in 2nd material v = c/n" value={`${(C / n2 / 1e8).toFixed(2)} × 10⁸ m/s`} />
            <Readout label="Critical angle" value={crit === null ? 'None (light is slowing down)' : `${crit.toFixed(1)}°`} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{n2 > n1 ? 'Into a denser medium: light slows down and bends TOWARDS the normal.' : n2 < n1 ? 'Into a less dense medium: light speeds up and bends AWAY from the normal. Beyond the critical angle it can’t escape at all.' : 'Same material: no bending.'}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">The <b>refractive index</b> n = speed of light in vacuum ÷ speed in the material. <b>Total internal reflection</b> keeps light trapped in optical fibres that carry India's internet, and makes diamonds (n = 2.42, critical angle only 24°) sparkle.</p>
    </LabFrame>
  )
}
