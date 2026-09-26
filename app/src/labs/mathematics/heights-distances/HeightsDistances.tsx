import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { fmt } from '../_shared/coord'
import { SliderRow } from '../_shared/SliderRow'
import { distanceFromAngle, heightFromElevation } from '../_shared/trig'

export default function HeightsDistances() {
  const [mode, setMode] = useState<'elevation' | 'depression'>('elevation')
  const [d, setD] = useState(40)
  const [ang, setAng] = useState(45)
  const [eye, setEye] = useState(1.5)
  const [h, setH] = useState(60)
  const H = heightFromElevation(d, ang, eye)
  const boat = distanceFromAngle(h, ang)
  return (
    <LabFrame labId="heights-distances" title="Heights and Distances" subtitle="Measure an angle and one distance, and trigonometry gives you heights you can’t reach." howTo={<p>In <b>Elevation</b> mode, find the height of a tower from where you stand. In <b>Depression</b> mode, find how far a boat is from a lighthouse.</p>}>
      <div className="mb-3 flex gap-2">{(['elevation', 'depression'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`rounded-lg border-2 px-3 py-1 text-sm ${mode === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted'}`}>Angle of {m}</button>)}</div>
      {mode === 'elevation' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 300 230" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Tower about ${fmt(H, 1)} m tall`}>
            <line x1={0} y1={210} x2={300} y2={210} stroke="currentColor" opacity={0.4} />
            {(() => { const k = Math.min(210 / d, 190 / H); const tx = 260; const ex = tx - d * k; const ey = 210 - eye * k; const top = 210 - H * k; return (<>
              <rect x={tx - 8} y={top} width={16} height={210 - top} fill="#a16207" />
              <circle cx={ex} cy={ey} r={3} fill="currentColor" /><text x={ex - 8} y={206} fontSize={16} textAnchor="middle">🧍</text>
              <line x1={ex} y1={ey} x2={tx} y2={top} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
              <line x1={ex} y1={ey} x2={tx} y2={ey} stroke="#2563eb" strokeDasharray="3 3" />
              <text x={ex + 30} y={ey - 12} fontSize={11} fill="#f59e0b" fontWeight={700}>{ang}°</text>
              <text x={(ex + tx) / 2} y={224} textAnchor="middle" fontSize={11} fill="currentColor">{d} m</text>
              <text x={tx - 12} y={(top + 210) / 2} textAnchor="end" fontSize={11} fill="currentColor">h?</text>
            </>) })()}
          </svg>
          <div className="space-y-3">
            <SliderRow label="Distance from the tower (m)" value={d} min={10} max={120} step={5} onChange={setD} />
            <SliderRow label="Angle of elevation" value={ang} shown={`${ang}°`} min={10} max={70} step={1} onChange={setAng} />
            <SliderRow label="Eye height (m)" value={eye} shown={fmt(eye, 1)} min={0} max={2} step={0.1} onChange={setEye} />
            <p className="rounded-xl bg-muted/60 px-3 py-2 font-mono text-sm">h = d × tan θ + eye = {d} × tan {ang}° + {fmt(eye, 1)}</p>
            <Readout label="Height of the tower" value={`${fmt(H, 1)} m`} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 300 230" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Boat ${fmt(boat, 1)} m from the lighthouse`}>
            <rect x={0} y={200} width={300} height={30} fill="#0ea5e955" />
            {(() => { const k = Math.min(250 / boat, 180 / h); const top = 200 - h * k; const bx = 30 + boat * k; return (<>
              <rect x={22} y={top} width={16} height={200 - top} fill="#e11d48" />
              <line x1={30} y1={top} x2={290} y2={top} stroke="#2563eb" strokeDasharray="3 3" />
              <line x1={30} y1={top} x2={bx} y2={196} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
              <text x={bx} y={204} fontSize={18} textAnchor="middle">⛵</text>
              <text x={70} y={top + 16} fontSize={11} fill="#f59e0b" fontWeight={700}>{ang}°</text>
              <text x={44} y={(top + 200) / 2} fontSize={11} fill="currentColor">{h} m</text>
            </>) })()}
          </svg>
          <div className="space-y-3">
            <SliderRow label="Lighthouse height (m)" value={h} min={20} max={100} step={5} onChange={setH} />
            <SliderRow label="Angle of depression" value={ang} shown={`${ang}°`} min={10} max={70} step={1} onChange={setAng} />
            <p className="rounded-xl bg-muted/60 px-3 py-2 font-mono text-sm">distance = h ÷ tan θ = {h} ÷ tan {ang}°</p>
            <Readout label="Distance of the boat" value={`${fmt(boat, 1)} m`} />
            <p className="text-sm text-muted-foreground">The angle of depression from the top equals the angle of elevation from the boat (alternate angles).</p>
          </div>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">The <b>angle of elevation</b> is measured up from the horizontal; the <b>angle of depression</b> is measured down from it. Surveyors in the Great Trigonometrical Survey of India (1802–1871) used these methods to measure the height of Mount Everest.</p>
    </LabFrame>
  )
}
