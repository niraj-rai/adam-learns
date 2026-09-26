import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const PARTS = [
  { id: 'r5', name: '5 Ω resistor', R: (_: number) => 5, colour: '#6366f1' },
  { id: 'r10', name: '10 Ω resistor', R: (_: number) => 10, colour: '#10b981' },
  { id: 'r20', name: '20 Ω resistor', R: (_: number) => 20, colour: '#f59e0b' },
  // a filament gets hotter as the voltage rises, so its resistance rises too (not ohmic)
  { id: 'bulb', name: 'Torch bulb (filament)', R: (V: number) => 4 + 2.2 * V, colour: '#ef4444' },
]

export default function OhmsLaw() {
  const [pid, setPid] = useState('r10')
  const [cells, setCells] = useState(2)
  const [rows, setRows] = useState<{ part: string; V: number; I: number }[]>([])
  const part = PARTS.find((p) => p.id === pid)!
  const V = cells * 1.5
  const R = part.R(V)
  const I = V / R
  const record = () => setRows((r) => [...r.filter((x) => !(x.part === pid && x.V === V)), { part: pid, V, I }])
  const Xg = (v: number) => 30 + (v / 9) * 250
  const Yg = (i: number) => 170 - (i / 1.8) * 150
  return (
    <LabFrame labId="ohms-law" title="Ohm's Law" subtitle="For a metal wire at constant temperature, current is proportional to potential difference: V = IR." howTo={<p>Choose a component and the number of 1.5 V cells. Read the ammeter and voltmeter, record the result, and build a V–I graph. Compare the resistors with a filament bulb.</p>}>
      <div className="flex flex-wrap gap-1">{PARTS.map((p) => <button key={p.id} type="button" aria-pressed={pid === p.id} onClick={() => setPid(p.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pid === p.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}><span style={{ color: p.colour }}>●</span> {p.name}</button>)}</div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 190" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Circuit with ${cells} cells: ${V} volts and ${I.toFixed(2)} amperes`}>
          <rect x={30} y={30} width={240} height={110} fill="none" stroke="currentColor" strokeWidth={2} />
          {Array.from({ length: cells }, (_, k) => <g key={k}><line x1={50 + k * 16} y1={22} x2={50 + k * 16} y2={38} stroke="currentColor" strokeWidth={3} /><line x1={56 + k * 16} y1={26} x2={56 + k * 16} y2={34} stroke="currentColor" strokeWidth={5} /></g>)}
          <rect x={120} y={130} width={60} height={20} fill={part.colour} rx={pid === 'bulb' ? 10 : 2} />
          <circle cx={270} cy={85} r={16} fill="var(--background)" stroke="currentColor" strokeWidth={2} /><text x={270} y={90} textAnchor="middle" fontSize={13} fontWeight={700} fill="currentColor">A</text>
          <line x1={120} y1={170} x2={180} y2={170} stroke="currentColor" /><line x1={120} y1={140} x2={120} y2={170} stroke="currentColor" /><line x1={180} y1={140} x2={180} y2={170} stroke="currentColor" />
          <circle cx={150} cy={170} r={13} fill="var(--background)" stroke="currentColor" strokeWidth={2} /><text x={150} y={175} textAnchor="middle" fontSize={12} fontWeight={700} fill="currentColor">V</text>
          <text x={210} y={120} fontSize={11} fill="currentColor">{I.toFixed(2)} A</text>
          <text x={185} y={185} fontSize={11} fill="currentColor">{V.toFixed(1)} V</text>
        </svg>
        <div className="space-y-3">
          <label className="block text-sm">Cells (1.5 V each) <b>{cells}</b><Slider value={[cells]} min={1} max={6} step={1} onValueChange={([v]) => setCells(v)} className="mt-1" aria-label="number of cells" /></label>
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Voltmeter V" value={`${V.toFixed(1)} V`} />
            <Readout label="Ammeter I" value={`${I.toFixed(3)} A`} />
            <Readout label="R = V ÷ I" value={`${R.toFixed(1)} Ω`} />
          </div>
          <Button onClick={record}>📋 Record</Button>
        </div>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 300 190" className="w-full rounded-2xl border bg-background" role="img" aria-label="Graph of current against voltage">
          <line x1={30} y1={170} x2={290} y2={170} stroke="currentColor" /><line x1={30} y1={10} x2={30} y2={170} stroke="currentColor" />
          <text x={288} y={185} textAnchor="end" fontSize={9} fill="currentColor">V (volts) → 9</text><text x={34} y={16} fontSize={9} fill="currentColor">I (A) 1.8</text>
          {PARTS.map((p) => { const pts = rows.filter((r) => r.part === p.id).sort((a, b) => a.V - b.V); return <g key={p.id}>{pts.length > 1 && <polyline points={[{ V: 0, I: 0 }, ...pts].map((r) => `${Xg(r.V)},${Yg(r.I)}`).join(' ')} fill="none" stroke={p.colour} strokeWidth={2} />}{pts.map((r) => <circle key={r.V} cx={Xg(r.V)} cy={Yg(r.I)} r={4} fill={p.colour} />)}</g> })}
        </svg>
        <p className="self-center rounded-xl bg-muted/60 px-3 py-2 text-sm">Straight lines through the origin mean I ∝ V: the component obeys Ohm's law. A steeper line means a smaller resistance. The bulb's line curves because its filament heats up and its resistance increases.</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Current</b> is the rate of flow of charge (I = Q/t, in amperes); <b>potential difference</b> is the work done per unit charge (V = W/Q, in volts). <b>Ohm's law:</b> V = IR, where R is the resistance in ohms (Ω). The ammeter goes in series; the voltmeter goes in parallel across the component.</p>
    </LabFrame>
  )
}
