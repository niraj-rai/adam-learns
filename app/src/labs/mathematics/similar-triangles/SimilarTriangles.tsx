import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { SliderRow } from '../_shared/SliderRow'

const A = { x: 150, y: 20 }
const B = { x: 30, y: 220 }
const C = { x: 280, y: 220 }
const lerp = (p: { x: number; y: number }, q: { x: number; y: number }, t: number) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })

export default function SimilarTriangles() {
  const [mode, setMode] = useState<'bpt' | 'scale'>('bpt')
  const [t, setT] = useState(0.4)
  const [k, setK] = useState(1.5)
  const D = lerp(A, B, t)
  const E = lerp(A, C, t)
  const AB = 10
  const AC = 12
  return (
    <LabFrame labId="similar-triangles" title="Similar Triangles" subtitle="Similar triangles have equal angles and sides in the same ratio. A line parallel to one side splits the other two in the same ratio." howTo={<p>In <b>Parallel line</b> mode, slide DE up and down: AD/DB always equals AE/EC. In <b>Scale</b> mode, enlarge a triangle and compare side and area ratios.</p>}>
      <div className="mb-3 flex gap-2">{(['bpt', 'scale'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`rounded-lg border-2 px-3 py-1 text-sm ${mode === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{m === 'bpt' ? 'Parallel line (BPT)' : 'Scale factor'}</button>)}</div>
      {mode === 'bpt' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 310 240" className="w-full rounded-2xl border bg-background" role="img" aria-label="Triangle ABC with DE parallel to BC">
            <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#7c3aed22" stroke="#7c3aed" strokeWidth={2} />
            <polygon points={`${A.x},${A.y} ${D.x},${D.y} ${E.x},${E.y}`} fill="#f59e0b33" />
            <line x1={D.x} y1={D.y} x2={E.x} y2={E.y} stroke="#dc2626" strokeWidth={3} />
            {[['A', A, 0, -6], ['B', B, -12, 12], ['C', C, 6, 12], ['D', D, -14, 4], ['E', E, 6, 4]].map(([l, p, dx, dy]) => <text key={l as string} x={(p as typeof A).x + (dx as number)} y={(p as typeof A).y + (dy as number)} fontSize={13} fontWeight={700} fill="currentColor">{l as string}</text>)}
          </svg>
          <div className="space-y-3">
            <SliderRow label="Position of DE (AD ÷ AB)" value={t} shown={fmt(t)} min={0.1} max={0.9} step={0.05} onChange={setT} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Readout label="AD : DB" value={`${fmt(AB * t, 1)} : ${fmt(AB * (1 - t), 1)} = ${fmt(t / (1 - t))}`} />
              <Readout label="AE : EC" value={`${fmt(AC * t, 1)} : ${fmt(AC * (1 - t), 1)} = ${fmt(t / (1 - t))}`} />
              <Readout label="DE : BC" value={fmt(t)} />
              <Readout label="Area ADE : area ABC" value={`${fmt(t * t)} (= ${fmt(t)}²)`} />
            </div>
            <p className="text-sm text-muted-foreground">Here AB = 10 cm and AC = 12 cm. Triangle ADE is similar to triangle ABC (AA: they share angle A, and corresponding angles on parallel lines are equal).</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 310 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Triangle enlarged by scale factor ${k}`}>
            <polygon points="20,220 80,220 20,140" fill="#7c3aed33" stroke="#7c3aed" strokeWidth={2} />
            <text x={40} y={234} fontSize={11} fill="currentColor">3</text><text x={8} y={184} fontSize={11} fill="currentColor">4</text>
            <polygon points={`110,220 ${110 + 60 * k},220 110,${220 - 80 * k}`} fill="#f59e0b33" stroke="#f59e0b" strokeWidth={2} />
            <text x={110 + 30 * k} y={234} fontSize={11} fill="currentColor">{fmt(3 * k, 1)}</text><text x={96} y={220 - 40 * k} fontSize={11} fill="currentColor" textAnchor="end">{fmt(4 * k, 1)}</text>
          </svg>
          <div className="space-y-3">
            <SliderRow label="Scale factor k" value={k} shown={fmt(k, 2)} min={0.5} max={2.5} step={0.25} onChange={setK} />
            <div className="grid gap-2 sm:grid-cols-2">
              <Readout label="Side ratio" value={`1 : ${fmt(k)}`} />
              <Readout label="Perimeter" value={`12 → ${fmt(12 * k, 1)}`} />
              <Readout label="Area ratio (k²)" value={`1 : ${fmt(k * k)}`} />
              <Readout label="Area" value={`6 → ${fmt(6 * k * k, 2)}`} />
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Basic Proportionality Theorem (Thales):</b> if a line is parallel to one side of a triangle, it divides the other two sides in the same ratio. Triangles are similar by <b>AA</b>, <b>SSS</b> (sides in proportion) or <b>SAS</b> (an equal angle between proportional sides). If sides scale by k, areas scale by <b>k²</b>. Thales is said to have measured a pyramid’s height using its shadow and similar triangles.</p>
    </LabFrame>
  )
}
