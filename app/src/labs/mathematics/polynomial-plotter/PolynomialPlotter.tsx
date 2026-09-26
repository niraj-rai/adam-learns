import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { degree, evaluate, format, integerZeros, type Poly } from '../_shared/poly'

const NAMES = ['constant', 'linear', 'quadratic', 'cubic']
const W = 320
const H = 260
const XR = 5
const YR = 20

export default function PolynomialPlotter() {
  const [c, setC] = useState<Poly>([-6, 11, -6, 1]) // x³ − 6x² + 11x − 6
  const [at, setAt] = useState(4)
  const d = degree(c)
  const X = (x: number) => ((x + XR) / (2 * XR)) * W
  const Y = (y: number) => H / 2 - (Math.max(-YR * 1.5, Math.min(YR * 1.5, y)) / YR) * (H / 2)
  const pts = Array.from({ length: 201 }, (_, i) => { const x = -XR + (i / 200) * 2 * XR; return `${X(x)},${Y(evaluate(c, x))}` }).join(' ')
  const zeros = integerZeros(c, XR)
  const setK = (k: number, v: number) => setC((p) => p.map((x, i) => (i === k ? v : x)))
  return (
    <LabFrame labId="polynomial-plotter" title="Polynomial Plotter" subtitle="A polynomial's degree is its highest power. Its zeros are where its graph crosses the x-axis." howTo={<p>Change the coefficients of ax³ + bx² + cx + d. Watch the graph's shape, the degree and the zeros. Then evaluate p(x) at any value.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Graph of ${format(c)}`}>
          {Array.from({ length: 2 * XR + 1 }, (_, i) => i - XR).map((x) => <g key={x}><line x1={X(x)} y1={0} x2={X(x)} y2={H} stroke="currentColor" strokeOpacity={x === 0 ? 0.6 : 0.07} /><text x={X(x)} y={H / 2 + 12} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>{x || ''}</text></g>)}
          <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="currentColor" strokeOpacity={0.6} />
          <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2.5} />
          {zeros.map((z) => <circle key={z} cx={X(z)} cy={H / 2} r={5} fill="#dc2626" />)}
          {Math.abs(at) <= XR && <><line x1={X(at)} y1={H / 2} x2={X(at)} y2={Y(evaluate(c, at))} stroke="#10b981" strokeDasharray="3 3" /><circle cx={X(at)} cy={Y(evaluate(c, at))} r={4} fill="#10b981" /></>}
          <text x={6} y={12} fontSize={9} fill="currentColor" opacity={0.6}>y from −{YR} to {YR}</text>
        </svg>
        <div className="space-y-2">
          {[3, 2, 1, 0].map((k) => <label key={k} className="block text-sm">{k === 0 ? 'constant d' : `coefficient of x${['', '', '²', '³'][k]}`} = <b>{c[k]}</b><Slider value={[c[k]]} min={-12} max={12} step={1} onValueChange={([v]) => setK(k, v)} className="mt-1" aria-label={`coefficient of x to the ${k}`} /></label>)}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="p(x)" value={format(c)} />
        <Readout label="Degree" value={`${d} (${NAMES[d] ?? 'polynomial'})`} />
        <Readout label="Whole-number zeros shown" value={zeros.length ? zeros.map((z) => `x = ${fmt(z)}`).join(', ') : 'none in view'} />
      </div>
      <label className="mt-3 block text-sm">Evaluate at x = <b>{at}</b><Slider value={[at]} min={-5} max={5} step={1} onValueChange={([v]) => setAt(v)} className="mt-1" aria-label="x value" /></label>
      <p className="mt-1 font-mono text-sm">p({at}) = {fmt(evaluate(c, at))}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A polynomial of degree n has <b>at most n zeros</b>. Linear graphs are straight lines, quadratics are U-shaped parabolas, and cubics have an S-shape. A zero x = a means (x − a) is a <b>factor</b>.</p>
    </LabFrame>
  )
}
