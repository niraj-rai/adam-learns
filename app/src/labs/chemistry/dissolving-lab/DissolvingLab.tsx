import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { seeded } from '../particle-zoom/samples'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Solubility in grams per 100 g of water at 0, 20, 40, 60, 80, 100 °C (standard data tables). */
const SOLUTES = [
  { id: 'salt', name: 'Salt', formula: 'NaCl', color: '#e2e8f0', steps: [1, 5, 10], data: [35.7, 36.0, 36.6, 37.3, 38.4, 39.8] },
  { id: 'kno3', name: 'Potassium nitrate', formula: 'KNO₃', color: '#f1f5f9', steps: [1, 5, 20], data: [13.3, 31.6, 63.9, 110, 169, 246] },
  { id: 'sugar', name: 'Sugar', formula: 'C₁₂H₂₂O₁₁', color: '#fef9c3', steps: [5, 20, 50], data: [179, 204, 238, 287, 362, 487] },
] as const

type SoluteId = (typeof SOLUTES)[number]['id']

export function solubility(data: readonly number[], T: number) {
  const t = Math.max(0, Math.min(100, T))
  const i = Math.min(4, Math.floor(t / 20))
  const f = (t - i * 20) / 20
  return data[i] + (data[i + 1] - data[i]) * f
}

export default function DissolvingLab({ solute: initial = 'kno3' }: { solute?: SoluteId }) {
  const [soluteId, setSoluteId] = useState<SoluteId>(initial)
  const solute = SOLUTES.find((s) => s.id === soluteId)!
  const [T, setT] = useState(20)
  const [added, setAdded] = useState(0)
  const [points, setPoints] = useState<Record<string, { T: number; s: number }[]>>({})
  const [showTrue, setShowTrue] = useState(false)
  const [crystallised, setCrystallised] = useState(false)

  const max = solubility(solute.data, T)
  const dissolved = Math.min(added, max)
  const undissolved = Math.max(0, added - max)
  const saturated = added >= max - 0.05
  const myPoints = points[soluteId] ?? []

  const crystals = useMemo(() => {
    const r = seeded(7)
    return Array.from({ length: 80 }, () => ({ x: 40 + r() * 120, y: 176 - r() * 14, s: 4.5 + r() * 3.5, rot: r() * 45 }))
  }, [])
  const crystalCount = Math.min(80, Math.ceil((undissolved / Math.max(10, max)) * 60))

  const changeT = (v: number) => {
    const newMax = solubility(solute.data, v)
    // cooling a saturated solution makes crystals appear
    if (v < T && added > newMax && added <= max + 0.01 && !crystallised) {
      setCrystallised(true)
    }
    setT(v)
  }

  const record = () => {
    setPoints((p) => ({ ...p, [soluteId]: [...(p[soluteId] ?? []).filter((x) => x.T !== T), { T, s: Math.round(max * 10) / 10 }].sort((a, b) => a.T - b.T) }))
    sfx.click()
  }

  const trueCurve = [0, 20, 40, 60, 80, 100].map((t, i) => ({ T: t, true: solute.data[i] }))
  const tint = Math.min(0.5, dissolved / 600)

  return (
    <LabFrame
      labId="dissolving-lab"
      title="Dissolving Lab"
      subtitle="How much solute can 100 g of water dissolve?"
      howTo={
        <ol className="list-decimal space-y-1 pl-5">
          <li>Choose a solute and a temperature.</li>
          <li>Add solute a little at a time until some stays undissolved at the bottom. The solution is now <b>saturated</b>.</li>
          <li>Press <b>Record</b> to save that point, then change the temperature and repeat. You are drawing a <b>solubility curve</b>!</li>
          <li>Bonus: make a hot saturated solution, then cool it down. What appears?</li>
        </ol>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {SOLUTES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSoluteId(s.id)
              setAdded(0)
              setCrystallised(false)
            }}
            className={cn('rounded-full border px-3 py-1.5 text-sm', s.id === soluteId ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
          >
            {s.name} <span className="text-muted-foreground">{s.formula}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <div>
          <svg viewBox="0 0 200 200" className="mx-auto w-full max-w-[220px]" role="img" aria-label={`Beaker at ${T} °C with ${dissolved.toFixed(1)} g dissolved and ${undissolved.toFixed(1)} g undissolved`}>
            <rect x={30} y={60} width={140} height={125} rx={8} fill={T > 50 ? '#fb923c' : '#38bdf8'} opacity={0.12 + tint} />
            <rect x={30} y={60} width={140} height={125} rx={8} fill="none" />
            {crystals.slice(0, crystalCount).map((c, i) => (
              <motion.rect key={i} x={c.x} y={c.y} width={c.s} height={c.s} fill={solute.color} stroke="#475569" strokeWidth={1.1} transform={`rotate(${c.rot} ${c.x} ${c.y})`} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} />
            ))}
            <path d="M28 20 V182 a8 8 0 0 0 8 8 H164 a8 8 0 0 0 8 -8 V20" fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={3} />
            <text x={100} y={50} textAnchor="middle" fontSize={11} className="fill-muted-foreground">100 g water</text>
          </svg>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {solute.steps.map((g) => (
              <Button key={g} size="sm" variant="outline" onClick={() => { setAdded((a) => a + g); setCrystallised(false) }}>
                +{g} g
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => { setAdded(0); setCrystallised(false) }}>
              Empty
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold">Temperature: {T} °C</p>
            <Slider value={[T]} min={0} max={100} step={5} onValueChange={([v]) => changeT(v)} aria-label="Temperature" className="mt-2 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Readout label="Added" value={`${added.toFixed(0)} g`} />
            <Readout label="Dissolved" value={`${dissolved.toFixed(1)} g`} />
            <Readout label="At the bottom" value={`${undissolved.toFixed(1)} g`} />
            <Readout label="Solution mass" value={`${(100 + dissolved).toFixed(1)} g`} />
          </div>
          <div className={cn('rounded-xl border px-3 py-2 text-sm', saturated ? 'border-warn/50 bg-warn-soft' : 'bg-success-soft')} role="status">
            {added === 0 ? (
              'Pure water. Add some solute!'
            ) : saturated ? (
              <>
                <b>Saturated!</b> No more {solute.name.toLowerCase()} can dissolve at {T} °C. The solubility is about <b>{max.toFixed(1)} g per 100 g of water</b>.
              </>
            ) : (
              <>
                <b>Unsaturated.</b> All of it dissolved. The water could dissolve more.
              </>
            )}
            {crystallised && undissolved > 0 && <p className="mt-1">❄️ <b>Crystals formed as it cooled!</b> Colder water can hold less, so the extra solute came out as crystals. This is <b>crystallisation</b>.</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={record} disabled={!saturated || added === 0}>
              📍 Record solubility at {T} °C
            </Button>
            <Button variant="ghost" onClick={() => setShowTrue((v) => !v)}>
              {showTrue ? 'Hide' : 'Show'} textbook curve
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 h-60 rounded-xl border bg-background p-2">
        {myPoints.length === 0 && !showTrue ? (
          <div className="grid h-full place-items-center px-4 text-center text-sm text-muted-foreground">Record a saturated point to start your solubility curve.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="T" type="number" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 11 }} label={{ value: 'temperature (°C)', position: 'insideBottom', offset: -8, fontSize: 11 }} />
              <YAxis type="number" tick={{ fontSize: 11 }} width={44} label={{ value: 'g / 100 g water', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
              {showTrue && <Line data={trueCurve} dataKey="true" name="Textbook data" stroke="#94a3b8" strokeDasharray="4 4" dot={false} isAnimationActive={false} />}
              <Scatter data={myPoints.map((p) => ({ T: p.T, s: p.s }))} dataKey="s" name={`My ${solute.name.toLowerCase()} data`} fill="var(--chem)" />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </LabFrame>
  )
}
