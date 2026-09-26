import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { SliderRow } from '../_shared/SliderRow'
import { ratios, STANDARD } from '../_shared/trig'

const v = (x: number) => (x === Infinity ? 'not defined' : fmt(x, 3))

export default function TrigRatios() {
  const [deg, setDeg] = useState(30)
  const [hyp, setHyp] = useState(10)
  const r = ratios(deg)
  const opp = hyp * r.sin
  const adj = hyp * r.cos
  const s = 200 / 12
  const ox = 30
  const oy = 220
  return (
    <LabFrame labId="trig-ratios" title="Trigonometric Ratios" subtitle="In a right triangle, the ratios of the sides depend only on the angle, not on the size of the triangle." howTo={<p>Change the angle θ and the size of the triangle. The side lengths change, but sin θ, cos θ and tan θ stay the same for the same angle.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 260 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Right triangle with angle ${deg} degrees`}>
          <polygon points={`${ox},${oy} ${ox + adj * s},${oy} ${ox + adj * s},${oy - opp * s}`} fill="#7c3aed22" stroke="#7c3aed" strokeWidth={2} />
          {deg > 0 && deg < 90 && <rect x={ox + adj * s - 10} y={oy - 10} width={10} height={10} fill="none" stroke="currentColor" />}
          <path d={`M${ox + 28},${oy} A28,28 0 0 0 ${ox + 28 * r.cos},${oy - 28 * r.sin}`} fill="none" stroke="#f59e0b" strokeWidth={2} />
          <text x={ox + 34} y={oy - 8} fontSize={12} fill="#f59e0b" fontWeight={700}>θ</text>
          <text x={ox + (adj * s) / 2} y={oy + 14} textAnchor="middle" fontSize={11} fill="#2563eb">adjacent {fmt(adj, 1)}</text>
          <text x={ox + adj * s + 4} y={oy - (opp * s) / 2} fontSize={11} fill="#dc2626">opp {fmt(opp, 1)}</text>
          <text x={ox + (adj * s) / 2 - 10} y={oy - (opp * s) / 2 - 8} textAnchor="end" fontSize={11} fill="#10b981">hyp {hyp}</text>
        </svg>
        <div className="space-y-3">
          <SliderRow label="Angle θ" value={deg} shown={`${deg}°`} min={0} max={90} step={1} onChange={setDeg} />
          <SliderRow label="Hypotenuse" value={hyp} min={4} max={12} onChange={setHyp} />
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="sin θ = opp/hyp" value={v(r.sin)} />
            <Readout label="cos θ = adj/hyp" value={v(r.cos)} />
            <Readout label="tan θ = opp/adj" value={v(r.tan)} />
          </div>
          <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">sin²θ + cos²θ = {fmt(r.sin ** 2, 3)} + {fmt(r.cos ** 2, 3)} = <b>{fmt(r.sin ** 2 + r.cos ** 2, 3)}</b>, whatever the angle.</p>
          <div className="flex flex-wrap gap-1">{[0, 30, 45, 60, 90].map((a) => <button key={a} type="button" onClick={() => setDeg(a)} className={`rounded-lg border px-2 py-1 text-xs ${deg === a ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{a}°</button>)}</div>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-center text-sm">
          <thead><tr className="border-b"><th className="py-1 text-left">θ</th>{Object.keys(STANDARD).map((a) => <th key={a} className={+a === deg ? 'text-chem' : ''}>{a}°</th>)}</tr></thead>
          <tbody>{(['sin', 'cos', 'tan'] as const).map((f) => <tr key={f} className="border-b"><td className="py-1 text-left font-semibold">{f}</td>{Object.entries(STANDARD).map(([a, row]) => <td key={a} className={+a === deg ? 'font-bold text-chem' : ''}>{row[f]}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Remember: <b>SOH CAH TOA</b>. The reciprocals are cosec θ = 1/sin θ, sec θ = 1/cos θ and cot θ = 1/tan θ. Also sin(90° − θ) = cos θ. The word “sine” comes from the Sanskrit <i>jyā</i> (bowstring), used by Aryabhata around 500 CE.</p>
    </LabFrame>
  )
}
