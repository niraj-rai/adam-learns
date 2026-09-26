import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { parallel, series } from '../_shared/circuits'

type Layout = 'series' | 'parallel' | 'mixed'
const f = (x: number) => (Math.round(x * 100) / 100).toString()

export default function ResistorNetwork() {
  const [layout, setLayout] = useState<Layout>('series')
  const [R, setR] = useState([2, 3, 6])
  const [V, setV] = useState(12)
  const Req = layout === 'series' ? series(R) : layout === 'parallel' ? parallel(R) : R[0] + parallel([R[1], R[2]])
  const I = V / Req
  const each = R.map((r, k) => {
    if (layout === 'series') return { I, V: I * r }
    if (layout === 'parallel') return { I: V / r, V }
    if (k === 0) return { I, V: I * r }
    const Vp = I * parallel([R[1], R[2]])
    return { I: Vp / r, V: Vp }
  })
  const colours = ['#6366f1', '#10b981', '#f59e0b']
  const Res = ({ x, y, k, vertical }: { x: number; y: number; k: number; vertical?: boolean }) => <g><rect x={vertical ? x - 8 : x} y={vertical ? y : y - 8} width={vertical ? 16 : 44} height={vertical ? 44 : 16} fill={colours[k]} rx={3} /><text x={vertical ? x + 12 : x + 22} y={vertical ? y + 26 : y - 12} textAnchor={vertical ? 'start' : 'middle'} fontSize={10} fill="currentColor">R{k + 1} = {R[k]} Ω</text></g>
  return (
    <LabFrame labId="resistor-network" title="Series and Parallel" subtitle="In series, resistances add. In parallel, the combined resistance is less than the smallest one." howTo={<p>Choose a layout, set the three resistors and the battery. Compare the current and voltage for each resistor.</p>}>
      <div className="inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['series', 'All in series'], ['parallel', 'All in parallel'], ['mixed', 'R1 + (R2 ∥ R3)']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={layout === k} onClick={() => setLayout(k)} className={cn('rounded-md px-3 py-1', layout === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <svg viewBox="0 0 360 170" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`${layout} circuit, equivalent resistance ${f(Req)} ohms`}>
        <path d="M30,140 L30,30 L330,30 L330,140 L30,140" fill="none" stroke="currentColor" strokeWidth={2} />
        <line x1={170} y1={132} x2={170} y2={148} stroke="currentColor" strokeWidth={3} /><line x1={178} y1={135} x2={178} y2={145} stroke="currentColor" strokeWidth={5} />
        <text x={174} y={165} textAnchor="middle" fontSize={11} fill="currentColor">{V} V</text>
        {layout === 'series' && [0, 1, 2].map((k) => <g key={k}><rect x={66 + k * 90} y={22} width={44} height={16} fill="var(--background)" /><Res x={66 + k * 90} y={30} k={k} /></g>)}
        {layout === 'parallel' && <>
          <rect x={100} y={24} width={160} height={12} fill="var(--background)" />
          <path d="M100,30 L100,110 M260,30 L260,110" stroke="currentColor" strokeWidth={2} />
          {[0, 1, 2].map((k) => <g key={k}><line x1={100} y1={50 + k * 30} x2={260} y2={50 + k * 30} stroke="currentColor" strokeWidth={2} /><rect x={158} y={42 + k * 30} width={44} height={16} fill="var(--background)" /><Res x={158} y={50 + k * 30} k={k} /></g>)}
          <path d="M100,30 L100,50 M260,30 L260,50" stroke="currentColor" strokeWidth={2} />
        </>}
        {layout === 'mixed' && <>
          <rect x={60} y={22} width={44} height={16} fill="var(--background)" /><Res x={60} y={30} k={0} />
          <rect x={170} y={24} width={120} height={12} fill="var(--background)" />
          <path d="M170,30 L170,100 M290,30 L290,100" stroke="currentColor" strokeWidth={2} />
          {[1, 2].map((k, j) => <g key={k}><line x1={170} y1={60 + j * 40} x2={290} y2={60 + j * 40} stroke="currentColor" strokeWidth={2} /><rect x={208} y={52 + j * 40} width={44} height={16} fill="var(--background)" /><Res x={208} y={60 + j * 40} k={k} /></g>)}
          <path d="M170,30 L170,60 M290,30 L290,60" stroke="currentColor" strokeWidth={2} />
        </>}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {R.map((r, k) => <label key={k} className="text-sm"><span style={{ color: colours[k] }}>R{k + 1}</span> = <b>{r} Ω</b><Slider value={[r]} min={1} max={20} step={1} onValueChange={([v]) => setR((x) => x.map((y, j) => (j === k ? v : y)))} className="mt-1" aria-label={`R${k + 1}`} /></label>)}
        <label className="text-sm">Battery <b>{V} V</b><Slider value={[V]} min={1} max={24} step={1} onValueChange={([v]) => setV(v)} className="mt-1" aria-label="battery voltage" /></label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Equivalent resistance" value={`${f(Req)} Ω`} />
        <Readout label="Current from the battery" value={`${f(I)} A`} />
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[320px] text-center text-sm">
          <thead><tr className="text-xs text-muted-foreground"><th className="p-1">Resistor</th><th className="p-1">Current</th><th className="p-1">Voltage across it</th></tr></thead>
          <tbody>{each.map((e, k) => <tr key={k} className="border-t"><td className="p-1 font-semibold" style={{ color: colours[k] }}>R{k + 1} ({R[k]} Ω)</td><td className="p-1 font-mono">{f(e.I)} A</td><td className="p-1 font-mono">{f(e.V)} V</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Series:</b> R = R₁ + R₂ + R₃; the same current flows through each; the voltages add up to the battery voltage. <b>Parallel:</b> 1/R = 1/R₁ + 1/R₂ + 1/R₃; each gets the full voltage; the currents add up. That's why homes are wired in parallel: every appliance gets 230 V and can be switched on and off on its own.</p>
    </LabFrame>
  )
}
