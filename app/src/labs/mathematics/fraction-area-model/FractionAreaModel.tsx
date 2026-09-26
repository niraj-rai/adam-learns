import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { frac, mixed, mul, show, value } from '../_shared/fraction'
import { fitCount } from './model'

export default function FractionAreaModel() {
  const [tab, setTab] = useState<'mul' | 'div'>('mul')
  return (
    <LabFrame labId="fraction-area-model" title="Fraction Area Model" subtitle="See why multiplying fractions makes a smaller piece, and why dividing can give a bigger answer." howTo={<p>Multiply: shade a fraction of the rows and a fraction of the columns; the overlap is the product. Divide: count how many copies of one fraction fit into another.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['mul', '✖️ Multiply'], ['div', '➗ Divide']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'mul' ? <Multiply /> : <Divide />}
    </LabFrame>
  )
}

function FracSlider({ label, n, d, setN, setD, maxN, maxD }: { label: string; n: number; d: number; setN: (v: number) => void; setD: (v: number) => void; maxN?: number; maxD: number }) {
  return (
    <div className="rounded-xl border p-3 text-sm">
      <p className="font-semibold">{label}: {n}/{d}</p>
      <label className="mt-2 block">Top (numerator) {n}
        <Slider value={[n]} min={1} max={maxN ?? d} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label={`${label} numerator`} />
      </label>
      <label className="mt-2 block">Bottom (denominator) {d}
        <Slider value={[d]} min={1} max={maxD} step={1} onValueChange={([v]) => { setD(v); if (maxN === undefined && n > v) setN(v) }} className="mt-1" aria-label={`${label} denominator`} />
      </label>
    </div>
  )
}

function Multiply() {
  const [a, setA] = useState(2)
  const [b, setB] = useState(3)
  const [c, setC] = useState(3)
  const [d, setD] = useState(4)
  const S = 240
  const prod = mul(frac(a, b), frac(c, d))
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <svg viewBox={`0 0 ${S + 20} ${S + 20}`} className="w-full max-w-[260px] rounded-2xl border bg-background" role="img" aria-label={`${a}/${b} of ${c}/${d} shaded: ${a * c} of ${b * d} small rectangles`}>
        {Array.from({ length: b }, (_, r) =>
          Array.from({ length: d }, (_, col) => {
            const inRow = r < a
            const inCol = col < c
            return <rect key={`${r}-${col}`} x={10 + (col * S) / d} y={10 + (r * S) / b} width={S / d} height={S / b} fill={inRow && inCol ? '#22c55e' : inRow ? '#7dd3fc' : inCol ? '#fde68a' : 'transparent'} stroke="currentColor" strokeOpacity={0.35} />
          }),
        )}
        <rect x={10} y={10} width={S} height={S} fill="none" stroke="currentColor" strokeWidth={2} />
      </svg>
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <FracSlider label="Rows (blue)" n={a} d={b} setN={setA} setD={setB} maxD={8} />
          <FracSlider label="Columns (yellow)" n={c} d={d} setN={setC} setD={setD} maxD={8} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Readout label="Green overlap" value={`${a * c} of ${b * d} pieces`} />
          <Readout label="Product" value={`${a}/${b} × ${c}/${d} = ${a * c}/${b * d}${show(prod) !== `${a * c}/${b * d}` ? ` = ${show(prod)}` : ''}`} />
        </div>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">“{a}/{b} × {c}/{d}” means <b>{a}/{b} of {c}/{d}</b>. Multiply the tops to count green pieces and the bottoms to count all pieces. Taking a fraction <i>of</i> something smaller than 1 always gives a smaller answer.</p>
      </div>
    </div>
  )
}

function Divide() {
  const [p, setP] = useState(3)
  const [q, setQ] = useState(2)
  const [r, setR] = useState(1)
  const [s, setS] = useState(4)
  const A = frac(p, q)
  const B = frac(r, s)
  const { q: ans, whole, part } = fitCount(A, B)
  const W = 600
  const wholes = Math.max(1, Math.ceil(value(A)))
  const x = (v: number) => 10 + (v / wholes) * (W - 20)
  const n = Math.ceil(value(ans))
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} 110`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${p}/${q} divided into pieces of ${r}/${s}: ${mixed(ans)} pieces`}>
        {Array.from({ length: Math.min(n, 60) }, (_, i) => {
          const from = i * value(B)
          const to = Math.min(value(A), (i + 1) * value(B))
          return <rect key={i} x={x(from)} y={30} width={Math.max(0, x(to) - x(from))} height={36} fill={i % 2 ? '#a78bfa' : '#c4b5fd'} stroke="#7c3aed" strokeWidth={1} opacity={i >= whole ? 0.55 : 1} />
        })}
        <rect x={x(0)} y={30} width={x(value(A)) - x(0)} height={36} fill="none" stroke="currentColor" strokeWidth={2} />
        {Array.from({ length: wholes + 1 }, (_, i) => (
          <g key={i}><line x1={x(i)} y1={22} x2={x(i)} y2={74} stroke="currentColor" /><text x={x(i)} y={92} textAnchor="middle" fontSize={12} fill="currentColor">{i}</text></g>
        ))}
        {n <= 24 && Array.from({ length: n }, (_, i) => (
          <text key={i} x={(x(i * value(B)) + x(Math.min(value(A), (i + 1) * value(B)))) / 2} y={53} textAnchor="middle" fontSize={11} fill="#3b0764">{i < whole ? i + 1 : '…'}</text>
        ))}
      </svg>
      <div className="grid gap-2 sm:grid-cols-2">
        <FracSlider label="Amount" n={p} d={q} setN={setP} setD={setQ} maxN={12} maxD={4} />
        <FracSlider label="Piece size" n={r} d={s} setN={setR} setD={setS} maxN={4} maxD={8} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="How many pieces fit?" value={`${whole} piece${whole === 1 ? '' : 's'}${part.n ? ` and ${show(part)} of another` : ''}`} />
        <Readout label="Keep, change, flip" value={`${p}/${q} ÷ ${r}/${s} = ${p}/${q} × ${s}/${r} = ${mixed(ans)}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Dividing asks <b>“how many {r}/{s}s fit into {p}/{q}?”</b> When the piece is smaller than 1, lots of pieces fit, so the answer can be bigger than what you started with. That's why dividing by a fraction is the same as multiplying by its <b>reciprocal</b> (flipped fraction).</p>
    </div>
  )
}
