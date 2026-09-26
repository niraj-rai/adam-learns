import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { cumulative, groupedMean, groupedMedian, groupedMode, type Class } from '../_shared/grouped'

const SETS: Record<string, { label: string; unit: string; classes: Class[] }> = {
  marks: { label: 'Maths test marks (out of 50)', unit: 'marks', classes: [{ lo: 0, hi: 10, f: 3 }, { lo: 10, hi: 20, f: 7 }, { lo: 20, hi: 30, f: 12 }, { lo: 30, hi: 40, f: 10 }, { lo: 40, hi: 50, f: 8 }] },
  wages: { label: 'Daily wages of 50 workers (₹ hundreds)', unit: '₹ hundreds', classes: [{ lo: 5, hi: 7, f: 6 }, { lo: 7, hi: 9, f: 14 }, { lo: 9, hi: 11, f: 16 }, { lo: 11, hi: 13, f: 9 }, { lo: 13, hi: 15, f: 5 }] },
  rain: { label: 'Monthly rainfall at 40 stations (cm)', unit: 'cm', classes: [{ lo: 0, hi: 20, f: 4 }, { lo: 20, hi: 40, f: 9 }, { lo: 40, hi: 60, f: 8 }, { lo: 60, hi: 80, f: 12 }, { lo: 80, hi: 100, f: 7 }] },
}

export default function GroupedStats() {
  const [key, setKey] = useState('marks')
  const [cs, setCs] = useState(SETS.marks.classes)
  const n = cs.reduce((a, c) => a + c.f, 0)
  const mean = groupedMean(cs)
  const med = groupedMedian(cs)
  const mode = groupedMode(cs)
  const cf = cumulative(cs)
  const bump = (i: number, dv: number) => setCs(cs.map((c, j) => (j === i ? { ...c, f: Math.max(1, c.f + dv) } : c)))
  const lo = cs[0].lo
  const hi = cs.at(-1)!.hi
  const W = 300
  const Hh = 170
  const X = (x: number) => 30 + ((x - lo) / (hi - lo)) * (W - 45)
  const Y = (y: number) => Hh - 20 - (y / n) * (Hh - 35)
  return (
    <LabFrame labId="grouped-stats" title="Mean, Median and Mode" subtitle="For grouped data we estimate the mean with class marks, the median from cumulative frequency, and the mode from the modal class." howTo={<p>Choose a data set, or change the frequencies with − and +. Watch how the three averages and the ogive respond.</p>}>
      <div className="mb-3 flex flex-wrap gap-2">{Object.entries(SETS).map(([k, v]) => <button key={k} type="button" aria-pressed={key === k} onClick={() => { setKey(k); setCs(v.classes) }} className={`rounded-lg border-2 px-3 py-1 text-sm ${key === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>{v.label}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] text-center text-sm">
            <thead><tr className="border-b text-xs"><th className="py-1">Class</th><th>fᵢ</th><th>xᵢ</th><th>fᵢxᵢ</th><th>cf</th></tr></thead>
            <tbody>{cs.map((c, i) => (
              <tr key={i} className={`border-b ${c === med.cls ? 'bg-chem-soft' : ''}`}>
                <td className="py-1">{c.lo}–{c.hi}{c === mode.cls ? ' ⭐' : ''}</td>
                <td><span className="inline-flex items-center gap-1"><button type="button" aria-label={`fewer in ${c.lo}–${c.hi}`} onClick={() => bump(i, -1)} className="rounded border px-1">−</button>{c.f}<button type="button" aria-label={`more in ${c.lo}–${c.hi}`} onClick={() => bump(i, 1)} className="rounded border px-1">+</button></span></td>
                <td>{fmt((c.lo + c.hi) / 2, 1)}</td><td>{fmt(((c.lo + c.hi) / 2) * c.f, 1)}</td><td>{cf[i]}</td>
              </tr>))}
              <tr className="font-semibold"><td>Total</td><td>{n}</td><td></td><td>{fmt(mean * n, 1)}</td><td></td></tr>
            </tbody>
          </table>
          <p className="mt-1 text-xs text-muted-foreground">Shaded: median class. ⭐: modal class.</p>
        </div>
        <svg viewBox={`0 0 ${W} ${Hh}`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Ogive with median about ${fmt(med.median, 1)}`}>
          <line x1={30} y1={Hh - 20} x2={W - 10} y2={Hh - 20} stroke="currentColor" opacity={0.5} />
          <line x1={30} y1={10} x2={30} y2={Hh - 20} stroke="currentColor" opacity={0.5} />
          {[lo, ...cs.map((c) => c.hi)].map((x) => <text key={x} x={X(x)} y={Hh - 6} fontSize={9} textAnchor="middle" fill="currentColor">{x}</text>)}
          <polyline points={[`${X(lo)},${Y(0)}`, ...cs.map((c, i) => `${X(c.hi)},${Y(cf[i])}`)].join(' ')} fill="none" stroke="#7c3aed" strokeWidth={2.5} />
          <line x1={30} y1={Y(n / 2)} x2={X(med.median)} y2={Y(n / 2)} stroke="#dc2626" strokeDasharray="4 3" />
          <line x1={X(med.median)} y1={Y(n / 2)} x2={X(med.median)} y2={Hh - 20} stroke="#dc2626" strokeDasharray="4 3" />
          <text x={34} y={Y(n / 2) - 4} fontSize={9} fill="#dc2626">n/2 = {fmt(n / 2, 1)}</text>
          <text x={W - 12} y={20} fontSize={9} textAnchor="end" fill="currentColor">“less than” ogive</text>
        </svg>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Mean = Σfᵢxᵢ ÷ Σfᵢ" value={`${fmt(mean, 2)} ${SETS[key].unit}`} />
        <Readout label="Median = l + ((n/2 − cf) ÷ f) × h" value={`${fmt(med.median, 2)}`} />
        <Readout label="Mode = l + ((f₁ − f₀) ÷ (2f₁ − f₀ − f₂)) × h" value={`${fmt(mode.mode, 2)}`} />
      </div>
      <p className="mt-2 font-mono text-xs text-muted-foreground">Median: {med.cls.lo} + (({fmt(n / 2, 1)} − {med.cf}) ÷ {med.cls.f}) × {med.cls.hi - med.cls.lo} = {fmt(med.median, 2)}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A useful check: <b>3 × median ≈ mode + 2 × mean</b> (the empirical relationship). The median is where the ogive reaches n/2. Use the median when a few extreme values would distort the mean, like incomes.</p>
    </LabFrame>
  )
}
