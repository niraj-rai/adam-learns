import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { hydrocarbon, type Family } from '../_shared/organic'
import { molarMass, pretty } from '../_shared/quantities'

const BP: Record<number, number> = { 1: -162, 2: -89, 3: -42, 4: -1, 5: 36, 6: 69, 7: 98, 8: 126 } // alkane boiling points °C

export default function CarbonChain() {
  const [n, setN] = useState(3)
  const [fam, setFam] = useState<Family>('alkane')
  const valid = fam === 'alkane' || n >= 2
  const h = hydrocarbon(valid ? n : 2, fam)
  const W = 60 + n * 60
  const bondAt = fam === 'alkane' ? -1 : 0 // the double/triple bond is between C1 and C2
  return (
    <LabFrame labId="carbon-chain" title="Carbon Chains" subtitle="Alkanes, alkenes and alkynes: chains of carbon atoms that form homologous series." howTo={<p>Choose the number of carbons and the type of bond. Watch the name, formula and structure change. Each member differs from the next by CH₂.</p>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Carbon atoms <b>{n}</b><Slider value={[n]} min={1} max={8} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="number of carbon atoms" /></label>
        <div className="flex flex-wrap items-end gap-1">{([['alkane', 'C–C single (alkane)'], ['alkene', 'C=C double (alkene)'], ['alkyne', 'C≡C triple (alkyne)']] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={fam === k} onClick={() => setFam(k)} className={cn('rounded-lg border-2 px-2 py-1 text-xs', fam === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{l}</button>)}</div>
      </div>
      {!valid ? <p className="mt-3 rounded-xl bg-warn-soft px-3 py-2 text-sm">You need at least 2 carbons for a double or triple bond between carbons.</p> : (
        <>
          <div className="mt-3 overflow-x-auto rounded-2xl border bg-background p-2">
            <svg viewBox={`0 0 ${W} 120`} style={{ minWidth: `${Math.min(W, 560)}px` }} className="w-full" role="img" aria-label={`Structure of ${h.name}`}>
              {Array.from({ length: n }, (_, k) => {
                const x = 40 + k * 60
                const Hs = (fam === 'alkane' ? 2 : k <= 1 ? (fam === 'alkene' ? 1 : 0) : 2) + (k === 0 ? 1 : 0) + (k === n - 1 ? 1 : 0)
                const spots = [[0, -30], [0, 30], k === 0 ? [-30, 0] : null, k === n - 1 ? [30, 0] : null].filter(Boolean) as number[][]
                return (
                  <g key={k}>
                    {k < n - 1 && (k === bondAt ? Array.from({ length: fam === 'alkene' ? 2 : 3 }, (_, j) => <line key={j} x1={x + 12} y1={60 + (j - (fam === 'alkene' ? 0.5 : 1)) * 6} x2={x + 48} y2={60 + (j - (fam === 'alkene' ? 0.5 : 1)) * 6} stroke="currentColor" strokeWidth={2} />) : <line x1={x + 12} y1={60} x2={x + 48} y2={60} stroke="currentColor" strokeWidth={2} />)}
                    <circle cx={x} cy={60} r={12} fill="#374151" /><text x={x} y={64} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>C</text>
                    {spots.slice(0, Hs).map(([dx, dy], j) => <g key={j}><line x1={x + dx * 0.4} y1={60 + dy * 0.4} x2={x + dx * 0.75} y2={60 + dy * 0.75} stroke="currentColor" /><circle cx={x + dx} cy={60 + dy} r={8} fill="#e5e7eb" stroke="#9ca3af" /><text x={x + dx} y={60 + dy + 3} textAnchor="middle" fontSize={9} fill="#111">H</text></g>)}
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <Readout label="Name" value={h.name} />
            <Readout label="Formula" value={pretty(h.formula)} />
            <Readout label="General formula" value={fam === 'alkane' ? 'CₙH₂ₙ₊₂' : fam === 'alkene' ? 'CₙH₂ₙ' : 'CₙH₂ₙ₋₂'} />
            <Readout label="Molecular mass" value={`${molarMass(h.formula)} u`} />
          </div>
          {fam === 'alkane' && <p className="mt-2 text-sm">Boiling point of {h.name}: <b>{BP[n]} °C</b>. {n <= 4 ? 'A gas at room temperature (LPG is mostly propane and butane).' : 'A liquid at room temperature (found in petrol).'} Boiling points rise steadily along a homologous series.</p>}
        </>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>homologous series</b> is a family with the same general formula and similar chemical properties; each member has one more CH₂ than the last (14 u more). Alkanes are <b>saturated</b> (only single bonds); alkenes and alkynes are <b>unsaturated</b> and can undergo addition reactions, like the hydrogenation of vegetable oils with a nickel catalyst.</p>
    </LabFrame>
  )
}
