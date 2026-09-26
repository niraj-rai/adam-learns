import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { isPerfectSquare } from '../_shared/real'

const U = 32 // pixels per unit

export default function RootSpiral() {
  const [n, setN] = useState(6)
  const [line, setLine] = useState(2)
  // build the spiral of Theodorus: each triangle has legs √k and 1
  const pts: { x: number; y: number }[] = [{ x: 1, y: 0 }]
  let ang = 0
  for (let k = 1; k < n; k++) {
    ang += Math.atan(1 / Math.sqrt(k))
    const r = Math.sqrt(k + 1)
    pts.push({ x: r * Math.cos(ang), y: r * Math.sin(ang) })
  }
  const cx = 150
  const cy = 150
  const P = (p: { x: number; y: number }) => `${cx + p.x * U},${cy - p.y * U}`
  const r = Math.sqrt(line)
  return (
    <LabFrame labId="root-spiral" title="Square Root Spiral" subtitle="Irrational numbers like √2 and √3 have exact positions on the number line, even though their decimals never end or repeat." howTo={<p>Grow the spiral: each new triangle has a side of 1 and a hypotenuse of the next square root. Then put √n on the number line with a compass arc.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div>
          <svg viewBox="0 0 300 300" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Square root spiral up to √${n}`}>
            {pts.map((p, i) => <g key={i}><polygon points={`${cx},${cy} ${P(i === 0 ? { x: 0, y: 0 } : pts[i - 1])} ${P(p)}`} fill={i % 2 ? '#e0e7ff' : '#fef3c7'} stroke="#6366f1" strokeWidth={1} /></g>)}
            {pts.map((p, i) => <g key={`l${i}`}><line x1={cx} y1={cy} x2={cx + p.x * U} y2={cy - p.y * U} stroke="#dc2626" strokeWidth={1.5} /><text x={cx + p.x * U * 1.08} y={cy - p.y * U * 1.08 + 4} textAnchor="middle" fontSize={10} fill="#dc2626">√{i + 1}</text></g>)}
          </svg>
          <label className="mt-2 block text-sm">Triangles <b>{n - 1}</b> (up to √{n})<Slider value={[n]} min={2} max={17} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="spiral size" /></label>
        </div>
        <div className="space-y-3">
          <svg viewBox="0 0 300 130" className="w-full rounded-2xl border bg-background" role="img" aria-label={`√${line} on the number line`}>
            <line x1={10} y1={100} x2={290} y2={100} stroke="currentColor" />
            {[0, 1, 2, 3, 4].map((k) => <g key={k}><line x1={30 + k * 60} y1={95} x2={30 + k * 60} y2={105} stroke="currentColor" /><text x={30 + k * 60} y={120} textAnchor="middle" fontSize={11} fill="currentColor">{k}</text></g>)}
            {/* right triangle with legs √(line−1) along the axis and 1 up */}
            <line x1={30 + Math.sqrt(line - 1) * 60} y1={100} x2={30 + Math.sqrt(line - 1) * 60} y2={40} stroke="#6366f1" strokeWidth={2} />
            <line x1={30} y1={100} x2={30 + Math.sqrt(line - 1) * 60} y2={40} stroke="#dc2626" strokeWidth={2} />
            <path d={`M${30 + r * 60},100 A${r * 60},${r * 60} 0 0,0 ${30 + Math.sqrt(line - 1) * 60},40`} fill="none" stroke="#10b981" strokeDasharray="4 3" strokeWidth={2} />
            <circle cx={30 + r * 60} cy={100} r={4} fill="#10b981" />
            <text x={30 + r * 60} y={88} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight={700}>√{line}</text>
          </svg>
          <label className="block text-sm">Place √<b>{line}</b> on the number line<Slider value={[line]} min={2} max={16} step={1} onValueChange={([v]) => setLine(v)} className="mt-1" aria-label="number to root" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label={`√${line} ≈`} value={Math.sqrt(line).toFixed(6)} />
            <Readout label="Type" value={isPerfectSquare(line) ? 'Rational (a whole number)' : 'Irrational'} />
          </div>
          <p className="text-sm text-muted-foreground">Draw a right triangle with legs √{line - 1} and 1 at 0. By Pythagoras its hypotenuse is √{line}. Swing it down with a compass: where the arc meets the line is exactly √{line}.</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">An <b>irrational number</b> can't be written as p/q; its decimal never ends and never repeats. √2, √3, √5 and π are irrational. Together, rational and irrational numbers make the <b>real numbers</b>, and every point on the number line is a real number.</p>
    </LabFrame>
  )
}
