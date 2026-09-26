import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { cone, cylinder, sphere } from '../_shared/geometry'
import { SliderRow } from '../_shared/SliderRow'

const PI = Math.PI
const SHAPES = {
  capsule: { name: 'Capsule', emoji: '💊', parts: 'cylinder + 2 hemispheres' },
  icecream: { name: 'Ice-cream cone', emoji: '🍦', parts: 'cone + hemisphere' },
  tent: { name: 'Tent', emoji: '⛺', parts: 'cylinder + cone' },
}
type Shape = keyof typeof SHAPES

function measure(shape: Shape, r: number, h: number) {
  const hemiCurved = 2 * PI * r * r
  const hemiVol = sphere(r).volume / 2
  const cy = cylinder(r, h)
  const co = cone(r, h)
  if (shape === 'capsule') return { area: cy.curved + 2 * hemiCurved, volume: cy.volume + 2 * hemiVol, area_f: '2πrh + 2 × 2πr²', vol_f: 'πr²h + 2 × ⅔πr³' }
  if (shape === 'icecream') return { area: co.curved + hemiCurved, volume: co.volume + hemiVol, area_f: 'πrl + 2πr²', vol_f: '⅓πr²h + ⅔πr³' }
  return { area: cy.curved + co.curved, volume: cy.volume + co.volume, area_f: '2πrh + πrl', vol_f: 'πr²h + ⅓πr²h' }
}

export default function CombinedSolids() {
  const [shape, setShape] = useState<Shape>('capsule')
  const [r, setR] = useState(3)
  const [h, setH] = useState(8)
  const [R, setBig] = useState(6)
  const [small, setSmall] = useState(2)
  const m = measure(shape, r, h)
  const s = 12
  const cx = 130
  const recast = (R / small) ** 3
  return (
    <LabFrame labId="combined-solids" title="Combining Solids" subtitle="Real objects are often made of simple solids joined together. Add their volumes, but only count the surfaces you can see." howTo={<p>Pick an object and change its radius and height. Then melt a big sphere into small ones: volume is conserved.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">{(Object.keys(SHAPES) as Shape[]).map((k) => <button key={k} type="button" aria-pressed={shape === k} onClick={() => setShape(k)} className={`rounded-lg border-2 px-3 py-1 text-sm ${shape === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{SHAPES[k].emoji} {SHAPES[k].name}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 260 250" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${SHAPES[shape].name}: ${SHAPES[shape].parts}`}>
          {shape === 'capsule' && (<g fill="#7c3aed33" stroke="#7c3aed" strokeWidth={2}>
            <rect x={cx - r * s} y={125 - (h * s) / 2} width={2 * r * s} height={h * s} />
            <path d={`M${cx - r * s},${125 - (h * s) / 2} A${r * s},${r * s} 0 0 1 ${cx + r * s},${125 - (h * s) / 2}`} fill="#f59e0b44" />
            <path d={`M${cx - r * s},${125 + (h * s) / 2} A${r * s},${r * s} 0 0 0 ${cx + r * s},${125 + (h * s) / 2}`} fill="#f59e0b44" />
          </g>)}
          {shape === 'icecream' && (<g fill="#7c3aed33" stroke="#7c3aed" strokeWidth={2}>
            <path d={`M${cx - r * s},${80} L${cx},${80 + h * s} L${cx + r * s},${80} Z`} fill="#d9770655" />
            <path d={`M${cx - r * s},80 A${r * s},${r * s} 0 0 1 ${cx + r * s},80`} fill="#f9a8d4aa" />
          </g>)}
          {shape === 'tent' && (<g fill="#7c3aed33" stroke="#7c3aed" strokeWidth={2}>
            <rect x={cx - r * s} y={240 - (h * s) / 2} width={2 * r * s} height={(h * s) / 2} />
            <path d={`M${cx - r * s},${240 - (h * s) / 2} L${cx},${240 - h * s} L${cx + r * s},${240 - (h * s) / 2} Z`} fill="#10b98155" />
          </g>)}
          <text x={8} y={16} fontSize={11} fill="currentColor">{SHAPES[shape].parts}</text>
        </svg>
        <div className="space-y-3">
          <SliderRow label="Radius r (cm)" value={r} min={1} max={5} step={0.5} onChange={setR} />
          <SliderRow label={shape === 'tent' ? 'Height of each part h (cm)' : 'Height h (cm)'} value={h} min={2} max={shape === 'tent' ? 8 : 10} step={0.5} onChange={setH} />
          {shape === 'tent' && <p className="text-xs text-muted-foreground">The cylinder and the cone on top both have height h.</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label={`Outer surface (${m.area_f})`} value={`${fmt(m.area, 1)} cm²`} />
            <Readout label={`Volume (${m.vol_f})`} value={`${fmt(m.volume, 1)} cm³`} />
          </div>
          <p className="text-sm text-muted-foreground">The joined faces are hidden, so they are not part of the surface area. Volumes simply add.</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">🔥 Melt and recast</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <SliderRow label="Big sphere radius R" value={R} min={2} max={12} onChange={setBig} />
          <SliderRow label="Small sphere radius" value={small} min={1} max={6} onChange={setSmall} />
        </div>
        <p className="mt-2 font-mono text-sm">Number of small spheres = (⁴⁄₃πR³) ÷ (⁴⁄₃πr³) = (R/r)³ = ({R}/{small})³ = <b>{fmt(recast, 2)}</b>{Number.isInteger(recast) ? '' : ` → ${Math.floor(recast)} whole spheres`}</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Cone slant height l = √(r² + h²). Hemisphere: curved surface 2πr², volume ⅔πr³. When a solid is melted and recast, the <b>volume stays the same</b>, even though the surface area changes.</p>
    </LabFrame>
  )
}
