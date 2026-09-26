import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid } from '../_shared/CoordGrid'
import { fmt } from '../_shared/coord'
import { quadratic } from '../_shared/quadratic'
import { SliderRow } from '../_shared/SliderRow'

const term = (k: number, s: string, first = false) => (k === 0 ? '' : `${k < 0 ? ' − ' : first ? '' : ' + '}${Math.abs(k) === 1 && s ? '' : Math.abs(k)}${s}`)

export default function QuadraticLab() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(-2)
  const [c, setC] = useState(-3)
  const q = quadratic(a, b, c)
  const f = (x: number) => a * x * x + b * x + c
  const eq = `${term(a, 'x²', true)}${term(b, 'x')}${term(c, '')} = 0`
  return (
    <LabFrame labId="quadratic-lab" title="Quadratic Explorer" subtitle="The roots of ax² + bx + c = 0 are where the parabola crosses the x-axis. The discriminant tells you how many there are." howTo={<p>Change a, b and c. Watch the parabola move, and see how the discriminant b² − 4ac predicts the roots before you solve.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label={`Graph of y = ${eq.replace(' = 0', '')}`}>
          {(X, Y) => {
            let d = ''
            let pen = false
            for (let i = 0; i <= 160; i++) {
              const x = -8 + i / 10
              const y = f(x)
              if (y > -9 && y < 9) { d += `${pen ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)} `; pen = true } else pen = false
            }
            return (
              <>
                <path d={d} fill="none" stroke="#7c3aed" strokeWidth={3} />
                {q.roots.map((r) => Math.abs(r) <= 8 && <circle key={r} cx={X(r)} cy={Y(0)} r={6} fill="#dc2626" />)}
                {Math.abs(q.vertex.x) <= 8 && Math.abs(q.vertex.y) <= 8 && <circle cx={X(q.vertex.x)} cy={Y(q.vertex.y)} r={4} fill="#f59e0b" />}
              </>
            )
          }}
        </CoordGrid>
        <div className="space-y-3">
          <p className="rounded-xl border px-3 py-2 text-center font-mono text-lg">{eq}</p>
          <SliderRow label="a" value={a} min={-3} max={3} step={1} onChange={(v) => setA(v === 0 ? (a > 0 ? -1 : 1) : v)} />
          <SliderRow label="b" value={b} min={-8} max={8} onChange={setB} />
          <SliderRow label="c" value={c} min={-8} max={8} onChange={setC} />
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Discriminant D = b² − 4ac" value={`${b * b} − ${4 * a * c < 0 ? `(${4 * a * c})` : 4 * a * c} = ${q.D}`} />
            <Readout label="Nature of roots" value={q.kind} />
            <Readout label="Roots" value={q.roots.length ? q.roots.map((r) => fmt(r)).join(' and ') : 'none (graph misses the x-axis)'} />
            <Readout label="Sum and product" value={`${fmt(q.sum)} and ${fmt(q.product)}`} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 font-mono text-sm">x = (−b ± √D) / 2a = ({-b} ± √{q.D}) / {2 * a}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>D &gt; 0</b>: two distinct real roots. <b>D = 0</b>: two equal roots (the vertex touches the axis). <b>D &lt; 0</b>: no real roots. The roots always add to −b/a and multiply to c/a. The orange dot is the vertex, the turning point. Sridharacharya gave a method for solving quadratics over a thousand years ago.</p>
    </LabFrame>
  )
}
