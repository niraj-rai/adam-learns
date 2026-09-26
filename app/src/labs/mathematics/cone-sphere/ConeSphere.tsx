import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cone, cylinder, sphere } from '../_shared/geometry'

const f = (x: number) => x.toFixed(1)

export default function ConeSphere() {
  const [tab, setTab] = useState<'cone' | 'sphere' | 'archimedes'>('cone')
  const [r, setR] = useState(3)
  const [h, setH] = useState(4)
  const co = cone(r, h)
  const sp = sphere(r)
  const cy = cylinder(r, 2 * r)
  const S = 22
  return (
    <LabFrame labId="cone-sphere" title="Cones and Spheres" subtitle="Surface area and volume of cones and spheres, and Archimedes' favourite discovery." howTo={<p>Choose a solid and change its size. For Archimedes, compare a cone, a sphere and a cylinder that fit together exactly.</p>}>
      <div className="inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['cone', '🍦 Cone'], ['sphere', '⚽ Sphere'], ['archimedes', '🏺 Archimedes']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={tab}>
          {tab === 'cone' && <>
            <ellipse cx={150} cy={200} rx={r * S} ry={r * S * 0.25} fill="#fde68a" stroke="#a16207" strokeWidth={2} />
            <path d={`M${150 - r * S},200 L150,${200 - h * S} L${150 + r * S},200`} fill="#fde68a" fillOpacity={0.6} stroke="#a16207" strokeWidth={2} />
            <line x1={150} y1={200} x2={150} y2={200 - h * S} stroke="#2563eb" strokeDasharray="4 3" /><text x={156} y={200 - (h * S) / 2} fontSize={11} fill="#2563eb">h = {h}</text>
            <line x1={150} y1={200} x2={150 + r * S} y2={200} stroke="#dc2626" /><text x={150 + (r * S) / 2} y={214} textAnchor="middle" fontSize={11} fill="#dc2626">r = {r}</text>
            <text x={150 + (r * S) / 2 + 8} y={200 - (h * S) / 2} fontSize={11} fill="#10b981">l = {f(co.l)}</text>
          </>}
          {tab === 'sphere' && <>
            <circle cx={150} cy={120} r={r * S} fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} />
            <ellipse cx={150} cy={120} rx={r * S} ry={r * S * 0.25} fill="none" stroke="#2563eb" strokeDasharray="4 3" />
            <line x1={150} y1={120} x2={150 + r * S} y2={120} stroke="#dc2626" /><text x={150 + (r * S) / 2} y={114} textAnchor="middle" fontSize={11} fill="#dc2626">r = {r}</text>
          </>}
          {tab === 'archimedes' && (() => {
            const k = 90 / r
            return <g transform="translate(150,120)">
              <rect x={-r * k} y={-r * k} width={2 * r * k} height={2 * r * k} fill="#e2e8f0" stroke="#475569" strokeWidth={2} />
              <circle r={r * k} fill="#bfdbfe" stroke="#2563eb" strokeWidth={2} fillOpacity={0.8} />
              <path d={`M${-r * k},${r * k} L0,${-r * k} L${r * k},${r * k} Z`} fill="#fde68a" fillOpacity={0.7} stroke="#a16207" strokeWidth={2} />
            </g>
          })()}
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Radius r = <b>{r}</b><Slider value={[r]} min={1} max={4} step={0.5} onValueChange={([v]) => setR(v)} className="mt-1" aria-label="radius" /></label>
          {tab === 'cone' && <label className="block text-sm">Height h = <b>{h}</b><Slider value={[h]} min={1} max={8} step={0.5} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="height" /></label>}
          {tab === 'cone' && <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Slant height l = √(r² + h²)" value={f(co.l)} />
            <Readout label="Curved surface area πrl" value={f(co.curved)} />
            <Readout label="Total surface area πr(l + r)" value={f(co.total)} />
            <Readout label="Volume ⅓πr²h" value={f(co.volume)} />
          </div>}
          {tab === 'sphere' && <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Surface area 4πr²" value={f(sp.surface)} />
            <Readout label="Volume ⁴⁄₃πr³" value={f(sp.volume)} />
            <Readout label="Hemisphere: total surface 3πr²" value={f(3 * Math.PI * r * r)} />
            <Readout label="Hemisphere volume ⅔πr³" value={f(sp.volume / 2)} />
          </div>}
          {tab === 'archimedes' && <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Cone" value={f(cone(r, 2 * r).volume)} />
            <Readout label="Sphere" value={f(sp.volume)} />
            <Readout label="Cylinder" value={f(cy.volume)} />
          </div>}
          {tab === 'archimedes' && <p className="text-sm">Cone : sphere : cylinder = <b>1 : 2 : 3</b>. The sphere's surface area also equals the curved surface of the cylinder: {f(sp.surface)} = {f(cy.curved)}.</p>}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A cone holds exactly <b>one-third</b> of a cylinder with the same base and height (try filling one with sand!). Archimedes was so proud of the sphere-in-a-cylinder result that he asked for it to be carved on his tomb.</p>
    </LabFrame>
  )
}
