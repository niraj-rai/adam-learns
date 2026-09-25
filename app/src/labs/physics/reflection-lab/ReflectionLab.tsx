import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { angleToNormal, reflect } from './model'

const CX = 200
const CY = 170
const L = 140

export default function ReflectionLab() {
  const [i, setI] = useState(35)
  const [rough, setRough] = useState(false)
  const [table, setTable] = useState<{ i: number; r: number }[]>([])
  const t = (i * Math.PI) / 180
  const sx = CX - L * Math.sin(t)
  const sy = CY - L * Math.cos(t)
  // incoming ray travels down towards the mirror (maths axes: y up); the model reflects it off a horizontal mirror
  const out = reflect(Math.sin(t), -Math.cos(t), 0)
  const rx = CX + L * out.dx
  const ry = CY - L * out.dy
  const r = Math.round(angleToNormal(out.dx, out.dy, 0))
  // diffuse reflection: scattered rays from several points on a bumpy surface
  const scattered = useMemo(
    () => Array.from({ length: 7 }, (_, k) => {
      const px = CX - 60 + k * 20
      const tilt = ((k * 37) % 50) - 25 // bumpy surface: each point tilted differently
      const a = ((i + 2 * tilt) * Math.PI) / 180
      return { px, ex: px + 110 * Math.sin(a), ey: CY - 110 * Math.cos(a) }
    }),
    [i],
  )
  const record = () => setTable((tb) => (tb.some((row) => row.i === i) ? tb : [...tb, { i, r }].sort((a, b) => a.i - b.i)))

  return (
    <LabFrame labId="reflection-lab" title="Reflection Lab" subtitle="Shine a laser at a mirror. How are the two angles related?" howTo={<p>Change the angle of the incoming laser. Measure the angle of incidence and the angle of reflection, from the <b>normal</b> (the dotted line at 90° to the mirror). Record several results. Then swap the mirror for a rough surface.</p>}>
      <svg viewBox="0 0 400 200" className="w-full rounded-2xl border bg-slate-900" role="img" aria-label={`Laser at ${i} degrees to the normal ${rough ? 'hitting a rough surface and scattering' : `reflecting at ${i} degrees`}`}>
        <line x1={CX} y1={CY} x2={CX} y2={20} stroke="#94a3b8" strokeDasharray="4 4" />
        <text x={CX + 4} y={28} fontSize={10} fill="#94a3b8">normal</text>
        {rough ? (
          <>
            <path d={`M${CX - 150} ${CY} ${Array.from({ length: 30 }, (_, k) => `L${CX - 150 + k * 10 + 5} ${CY + (k % 2 ? 4 : -2)}`).join(' ')}`} stroke="#a8a29e" strokeWidth={3} fill="none" />
            {scattered.map((s, k) => (
              <g key={k}>
                <line x1={s.px - (CY - sy) * Math.tan(t)} y1={sy} x2={s.px} y2={CY} stroke="#ef4444" strokeWidth={1.5} opacity={0.8} />
                <line x1={s.px} y1={CY} x2={s.ex} y2={s.ey} stroke="#ef4444" strokeWidth={1.5} opacity={0.8} />
              </g>
            ))}
          </>
        ) : (
          <>
            <rect x={CX - 150} y={CY} width={300} height={8} fill="#cbd5e1" />
            <line x1={sx} y1={sy} x2={CX} y2={CY} stroke="#ef4444" strokeWidth={2.5} />
            <line x1={CX} y1={CY} x2={rx} y2={ry} stroke="#ef4444" strokeWidth={2.5} />
            <path d={`M ${CX} ${CY - 40} A 40 40 0 0 0 ${CX - 40 * Math.sin(t)} ${CY - 40 * Math.cos(t)}`} fill="none" stroke="#fbbf24" />
            <path d={`M ${CX} ${CY - 46} A 46 46 0 0 1 ${CX + 46 * Math.sin(t)} ${CY - 46 * Math.cos(t)}`} fill="none" stroke="#34d399" />
            <text x={CX - 30 - 20 * Math.sin(t)} y={CY - 50} fontSize={11} fill="#fbbf24">i = {i}°</text>
            <text x={CX + 12 + 20 * Math.sin(t)} y={CY - 56} fontSize={11} fill="#34d399">r = {r}°</text>
          </>
        )}
        <text x={sx - 12} y={sy - 4} fontSize={16}>🔦</text>
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <label className="block text-sm">Angle of incidence: <b>{i}°</b>
            <Slider value={[i]} min={0} max={80} step={5} onValueChange={([v]) => setI(v)} className="mt-1.5" aria-label="Angle of incidence" />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={rough ? 'outline' : 'default'} onClick={() => setRough(false)}>🪞 Smooth mirror</Button>
            <Button size="sm" variant={rough ? 'default' : 'outline'} onClick={() => setRough(true)}>🧱 Rough surface</Button>
            {!rough && <Button size="sm" variant="outline" onClick={record}>📋 Record result</Button>}
          </div>
          <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">
            {rough ? 'Diffuse (irregular) reflection: every tiny bump faces a different way, so parallel rays scatter in all directions. That is how we see ordinary objects like paper and walls from anywhere in the room.' : 'Regular reflection: the angle of incidence always equals the angle of reflection, and the incident ray, reflected ray and normal all lie in the same flat plane.'}
          </p>
        </div>
        <div>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="py-1">∠ incidence</th><th>∠ reflection</th></tr></thead>
            <tbody>
              {table.map((row) => <tr key={row.i} className="border-b border-dashed"><td className="py-1">{row.i}°</td><td>{row.r}°</td></tr>)}
              {!table.length && <tr><td colSpan={2} className="py-2 text-muted-foreground">Record at least 4 results.</td></tr>}
            </tbody>
          </table>
          {table.length >= 4 && <Readout className="mt-2" label="Pattern" value="∠i = ∠r every time!" />}
        </div>
      </div>
    </LabFrame>
  )
}
