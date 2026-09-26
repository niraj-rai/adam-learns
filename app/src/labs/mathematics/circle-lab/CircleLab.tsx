import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { circleArea, circumference, wedges } from './model'

export default function CircleLab() {
  const [tab, setTab] = useState<'roll' | 'area'>('roll')
  return (
    <LabFrame labId="circle-lab" title="Circle Lab" subtitle="Unroll a circle to meet π, then cut it into slices to find its area." howTo={<p>Unroll: change the diameter and see how many diameters fit around the edge. Slice: cut the circle into more and more sectors and rearrange them.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['roll', '🛞 Unroll'], ['area', '🍕 Slice and rearrange']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'roll' ? <Roll /> : <Slice />}
    </LabFrame>
  )
}

function Roll() {
  const [d, setD] = useState(4)
  const k = 30
  const C = circumference(d / 2)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 560 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`A circle of diameter ${d} unrolls to a length of ${C.toFixed(2)}`}>
        <circle cx={20 + (d / 2) * k} cy={85} r={(d / 2) * k} fill="#6366f1" fillOpacity={0.15} stroke="#6366f1" strokeWidth={3} />
        <line x1={20} y1={85} x2={20 + d * k} y2={85} stroke="#f59e0b" strokeWidth={2} />
        <line x1={20} y1={215} x2={20 + C * k} y2={215} stroke="#6366f1" strokeWidth={5} strokeLinecap="round" />
        {[1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={20 + (i - 1) * d * k} y={203} width={d * k} height={8} fill={i % 2 ? '#f59e0b' : '#fbbf24'} opacity={0.8} />
            <text x={20 + (i - 0.5) * d * k} y={197} textAnchor="middle" fontSize={11} fill="currentColor">d</text>
          </g>
        ))}
        <text x={20 + 3 * d * k + 4} y={197} fontSize={10} fill="currentColor">+0.14d</text>
      </svg>
      <label className="block text-sm">Diameter <b>{d}</b><Slider value={[d]} min={1} max={5} step={0.5} onValueChange={([v]) => setD(v)} className="mt-1" aria-label="Diameter" /></label>
      <div className="grid gap-2 sm:grid-cols-3">
        <Readout label="Circumference" value={`${C.toFixed(3)}`} />
        <Readout label="Circumference ÷ diameter" value={`${(C / d).toFixed(5)}…`} />
        <Readout label="Formula" value="C = πd = 2πr" />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Whatever the size, the edge is always just over <b>3 diameters</b> long: π ≈ 3.14159… (or 22/7 ≈ 3.142). Āryabhaṭa (499 CE) gave π ≈ 62832/20000 = 3.1416, and noted it was only an approximation.</p>
    </div>
  )
}

function Slice() {
  const [n, setN] = useState(12)
  const r = 4
  const k = 18
  const ws = wedges(n, r)
  const A = circleArea(r)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 560 220" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${n} sectors rearranged into a shape close to a rectangle`}>
        <g transform="translate(20, 20)">
          <circle cx={r * k} cy={r * k} r={r * k} fill="none" stroke="currentColor" strokeOpacity={0.3} />
          {Array.from({ length: n }, (_, i) => {
            const a = (2 * Math.PI * i) / n
            return <line key={i} x1={r * k} y1={r * k} x2={r * k + r * k * Math.cos(a)} y2={r * k + r * k * Math.sin(a)} stroke={i % 2 ? '#f59e0b' : '#6366f1'} strokeOpacity={0.6} />
          })}
        </g>
        <g transform="translate(180, 40)">
          {ws.map((w, i) => <polygon key={i} points={w.map(([x, y]) => `${x * k},${y * k}`).join(' ')} fill={i % 2 ? '#f59e0b' : '#6366f1'} fillOpacity={0.45} stroke="white" strokeWidth={0.5} />)}
          <text x={(Math.PI * r * k) / 2} y={r * k + 18} textAnchor="middle" fontSize={11} fill="currentColor">≈ half the circumference = πr</text>
          <text x={-6} y={(r * k) / 2} textAnchor="end" fontSize={11} fill="currentColor">r</text>
        </g>
      </svg>
      <label className="block text-sm">Number of slices <b>{n}</b><Slider value={[n]} min={4} max={48} step={2} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="Number of slices" /></label>
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="Rearranged shape" value="≈ rectangle πr long and r tall" />
        <Readout label={`Area (r = ${r})`} value={`πr² = π × ${r}² ≈ ${A.toFixed(2)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Half the slices point up and half point down. Their curved edges together make the circumference, split between top and bottom, so the shape is about <b>πr</b> long and <b>r</b> tall. The more slices, the closer it gets to a rectangle: area = πr × r = <b>πr²</b>.</p>
    </div>
  )
}
