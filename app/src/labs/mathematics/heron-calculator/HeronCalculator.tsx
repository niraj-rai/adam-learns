import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { brahmagupta, heron, isTriangle } from '../_shared/geometry'

const PRESETS = [
  { name: 'Right triangle', emoji: '📐', s: [3, 4, 5] },
  { name: 'Park plot', emoji: '🌳', s: [13, 14, 15] },
  { name: 'Equilateral', emoji: '🔺', s: [10, 10, 10] },
  { name: 'Thin sliver', emoji: '🪡', s: [10, 10, 19] },
]

/** Place a triangle with sides a (base), b, c using the cosine rule, scaled into a box. */
function coords(a: number, b: number, c: number) {
  const x = (a * a + c * c - b * b) / (2 * a)
  const y = Math.sqrt(Math.max(0, c * c - x * x))
  return { B: { x: 0, y: 0 }, C: { x: a, y: 0 }, A: { x, y } }
}

export default function HeronCalculator() {
  const [tab, setTab] = useState<'heron' | 'brahma'>('heron')
  const [s, setS] = useState([13, 14, 15])
  const [q, setQ] = useState([5, 5, 5, 5])
  const [a, b, c] = s
  const ok = isTriangle(a, b, c)
  const area = heron(a, b, c)
  const semi = (a + b + c) / 2
  const pts = coords(a, b, c)
  const minX = Math.min(0, pts.A.x)
  const maxX = Math.max(a, pts.A.x)
  const sc = Math.min(260 / (maxX - minX), 150 / Math.max(1, pts.A.y))
  const P = (p: { x: number; y: number }) => `${20 + (p.x - minX) * sc},${180 - p.y * sc}`
  return (
    <LabFrame labId="heron-calculator" title="Heron's Formula" subtitle="Find the area of any triangle from its three sides alone, no height needed." howTo={<p>Set the three side lengths (or pick a preset). The lab checks the triangle inequality and works through Heron's formula.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['heron', "Heron's formula (triangle)"], ['brahma', "Brahmagupta's formula (cyclic quadrilateral)"]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      {tab === 'heron' ? (
        <>
          <div className="mt-3 flex flex-wrap gap-1">{PRESETS.map((p) => <button key={p.name} type="button" onClick={() => setS(p.s)} className="rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">{p.emoji} {p.name}</button>)}</div>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
            <svg viewBox="0 0 300 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={ok ? `Triangle with sides ${a}, ${b}, ${c}` : 'Not a triangle'}>
              {ok ? <>
                <polygon points={`${P(pts.A)} ${P(pts.B)} ${P(pts.C)}`} fill="#6366f1" fillOpacity={0.15} stroke="#6366f1" strokeWidth={2.5} />
                <text x={(20 + (0 - minX) * sc + 20 + (a - minX) * sc) / 2} y={196} textAnchor="middle" fontSize={11} fill="currentColor">a = {a}</text>
              </> : <text x={150} y={100} textAnchor="middle" fontSize={13} fill="#dc2626">These sides can't make a triangle!</text>}
            </svg>
            <div className="space-y-2">
              {['a', 'b', 'c'].map((n, i) => <label key={n} className="block text-sm">{n} = <b>{s[i]}</b><Slider value={[s[i]]} min={1} max={30} step={1} onValueChange={([v]) => setS((x) => x.map((y, j) => (j === i ? v : y)))} className="mt-1" aria-label={`side ${n}`} /></label>)}
            </div>
          </div>
          {ok ? (
            <div className="mt-3 rounded-2xl border p-4 font-mono text-sm">
              <p>s = (a + b + c) ÷ 2 = ({a} + {b} + {c}) ÷ 2 = {semi}</p>
              <p>Area = √[s(s − a)(s − b)(s − c)] = √[{semi} × {semi - a} × {semi - b} × {semi - c}]</p>
              <p>= √{(semi * (semi - a) * (semi - b) * (semi - c)).toFixed(2).replace(/\.00$/, '')} = <b className="text-chem">{area.toFixed(2).replace(/\.00$/, '')}</b> square units</p>
            </div>
          ) : <p className="mt-3 rounded-xl bg-warn-soft px-4 py-2 text-sm">Triangle inequality: any two sides must add up to more than the third. {a}, {b} and {c} fail this.</p>}
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">{['a', 'b', 'c', 'd'].map((n, i) => <label key={n} className="text-sm">{n} = <b>{q[i]}</b><Slider value={[q[i]]} min={1} max={20} step={1} onValueChange={([v]) => setQ((x) => x.map((y, j) => (j === i ? v : y)))} className="mt-1" aria-label={`side ${n}`} /></label>)}</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="s = (a + b + c + d) ÷ 2" value={(q.reduce((x, y) => x + y, 0) / 2).toString()} />
            <Readout label="Area = √[(s−a)(s−b)(s−c)(s−d)]" value={Number.isNaN(brahmagupta(q[0], q[1], q[2], q[3])) ? 'Not possible' : brahmagupta(q[0], q[1], q[2], q[3]).toFixed(2)} />
          </div>
          <p className="text-sm text-muted-foreground">Brahmagupta (628 CE, in the Brāhmasphuṭasiddhānta) found this formula for a <b>cyclic</b> quadrilateral, one whose corners all lie on a circle. Make one side 0 and it becomes Heron's formula!</p>
        </div>
      )}
      {tab === 'heron' && <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Semi-perimeter s" value={semi} />
        <Readout label="Check with ½ × base × height" value={ok ? `½ × ${a} × ${(2 * area / a).toFixed(2)} = ${area.toFixed(2)}` : '—'} />
      </div>}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Heron of Alexandria (around 60 CE) gave this formula. It's perfect for real plots of land where you can measure the sides but not the height: split any field into triangles and add their areas.</p>
    </LabFrame>
  )
}
