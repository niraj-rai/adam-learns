import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CELL_RESULT, ISOTONIC, massChange, tonicity } from './model'

const W = 300
const H = 190
const X = (c: number) => 40 + (c / 1) * (W - 60)
const Y = (p: number) => 95 - (p / 25) * 80

export default function OsmosisLab() {
  const [conc, setConc] = useState(0)
  const [results, setResults] = useState<{ c: number; p: number }[]>([])
  const [cell, setCell] = useState<'plant' | 'animal'>('plant')
  const p = massChange(conc)
  const t = tonicity(conc)
  const start = 5.0
  const record = () => setResults((r) => [...r.filter((x) => x.c !== conc), { c: conc, p }].sort((a, b) => a.c - b.c))
  const scale = cell === 'animal' ? 1 + p / 40 : 1
  const shrink = cell === 'plant' && p < 0 ? 1 + p / 35 : 1
  return (
    <LabFrame labId="osmosis-lab" title="Osmosis Lab" subtitle="Water moves through a partially permeable membrane from a dilute solution to a more concentrated one." howTo={<p>Put a 5.00 g potato strip into sugar solutions of different strengths for 30 minutes. Record each result and plot the graph. Then see what happens to single plant and animal cells.</p>}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm">Sugar solution <b>{conc.toFixed(1)} mol/L</b> {conc === 0 && '(pure water)'}<Slider value={[conc]} min={0} max={1} step={0.1} onValueChange={([v]) => setConc(Math.round(v * 10) / 10)} className="mt-1" aria-label="sugar concentration" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Mass after 30 min" value={`${(start * (1 + p / 100)).toFixed(2)} g`} />
            <Readout label="% change" value={`${p > 0 ? '+' : ''}${p.toFixed(1)}%`.replace('-', '−')} />
          </div>
          <Button onClick={record}>📋 Record result</Button>
          <p className={cn('rounded-xl px-3 py-2 text-sm', t === 'hypotonic' ? 'bg-sky-100 dark:bg-sky-950/40' : t === 'hypertonic' ? 'bg-warn-soft' : 'bg-success-soft')}>
            The solution is <b>{t}</b> compared with the potato cells. {t === 'hypotonic' ? 'Water moves INTO the cells: the strip gains mass and becomes firm.' : t === 'hypertonic' ? 'Water moves OUT of the cells: the strip loses mass and goes floppy.' : 'No net movement of water.'}
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background" role="img" aria-label="Graph of percentage change in mass against sugar concentration">
          <line x1={40} y1={Y(0)} x2={W - 10} y2={Y(0)} stroke="currentColor" />
          <line x1={40} y1={10} x2={40} y2={H - 20} stroke="currentColor" />
          {[-20, -10, 10].map((v) => <text key={v} x={36} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="currentColor">{v}</text>)}
          <text x={44} y={14} fontSize={9} fill="currentColor">% change in mass</text>
          {[0, 0.5, 1].map((c) => <text key={c} x={X(c)} y={Y(0) + 12} textAnchor="middle" fontSize={9} fill="currentColor">{c}</text>)}
          <text x={W - 10} y={H - 6} textAnchor="end" fontSize={9} fill="currentColor">sugar (mol/L)</text>
          {results.length > 1 && <polyline points={results.map((r) => `${X(r.c)},${Y(r.p)}`).join(' ')} fill="none" stroke="#10b981" strokeWidth={2} />}
          {results.map((r) => <circle key={r.c} cx={X(r.c)} cy={Y(r.p)} r={4} fill="#10b981" />)}
          {results.length >= 4 && <><line x1={X(ISOTONIC)} y1={20} x2={X(ISOTONIC)} y2={H - 25} stroke="#ef4444" strokeDasharray="3 3" /><text x={X(ISOTONIC) + 4} y={30} fontSize={9} fill="#ef4444">no change ≈ {ISOTONIC}</text></>}
        </svg>
      </div>
      <div className="mt-4 rounded-2xl border p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">🔬 Under the microscope:</span>
          {(['plant', 'animal'] as const).map((k) => <button key={k} type="button" aria-pressed={cell === k} onClick={() => setCell(k)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm capitalize', cell === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{k === 'plant' ? '🌿 Plant cell' : '🩸 Red blood cell'}</button>)}
        </div>
        <div className="mt-2 grid items-center gap-3 sm:grid-cols-[180px_1fr]">
          <svg viewBox="0 0 180 120" className="mx-auto w-full max-w-[180px]" role="img" aria-label={CELL_RESULT[t][cell]}>
            {cell === 'plant' ? (
              <g>
                <rect x={30} y={15} width={120} height={90} rx={6} fill="none" stroke="#65a30d" strokeWidth={5} />
                <rect x={30 + 60 * (1 - shrink)} y={15 + 45 * (1 - shrink)} width={120 * shrink} height={90 * shrink} rx={10} fill="#bbf7d0" stroke="#16a34a" strokeWidth={2} />
                <ellipse cx={90} cy={60} rx={40 * shrink * (p > 0 ? 1.1 : 1)} ry={28 * shrink * (p > 0 ? 1.1 : 1)} fill="#e0f2fe" />
              </g>
            ) : (
              <g>
                {p > 9 ? <text x={90} y={70} textAnchor="middle" fontSize={28}>💥</text> : <ellipse cx={90} cy={60} rx={44 * scale} ry={30 * scale} fill="#ef4444" stroke="#991b1b" strokeWidth={2} strokeDasharray={p < -5 ? '4 3' : undefined} />}
              </g>
            )}
          </svg>
          <p className="text-sm">{CELL_RESULT[t][cell]}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Osmosis</b> is the movement of water molecules from a region of higher water concentration (a dilute solution) to lower water concentration (a concentrated solution) through a <b>partially permeable membrane</b>. Where the graph crosses zero, the solution matches the inside of the cells.</p>
    </LabFrame>
  )
}
