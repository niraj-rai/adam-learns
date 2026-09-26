import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { isSquare, isqrt } from '../_shared/number'
import { lastDigit, layerOf, oddSum, SQUARE_ENDINGS } from './model'

const LAYER = ['#f97316', '#0ea5e9', '#22c55e', '#a855f7', '#eab308', '#ec4899']
const CHECK = [2025, 1827, 4096, 7923, 1444, 3136, 5778, 2500, 1521, 4906]

export default function SquareBuilder() {
  const [tab, setTab] = useState<'odd' | 'digits'>('odd')
  return (
    <LabFrame labId="square-builder" title="Square Builder" subtitle="Build square numbers from dots and discover their hidden patterns." howTo={<p>Odd layers: grow a square and watch each new L-shaped layer. Last digits: find which endings a perfect square can never have.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['odd', '🟧 Odd layers'], ['digits', '🔚 Last digits']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'odd' ? <Odd /> : <Digits />}
    </LabFrame>
  )
}

function Odd() {
  const [n, setN] = useState(5)
  const S = 26
  const odds = oddSum(n)
  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <svg viewBox={`0 0 ${12 * S + 8} ${12 * S + 8}`} className="w-full max-w-[320px] rounded-2xl border bg-background" role="img" aria-label={`${n} by ${n} square of dots in ${n} L-shaped layers`}>
        {Array.from({ length: n }, (_, r) =>
          Array.from({ length: n }, (_, c) => (
            <circle key={`${r}-${c}`} cx={4 + S / 2 + c * S} cy={4 + S / 2 + (11 - r) * S} r={S * 0.36} fill={LAYER[(layerOf(r, c) - 1) % LAYER.length]} />
          )),
        )}
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Side length <b>{n}</b>
          <Slider value={[n]} min={1} max={12} step={1} onValueChange={([v]) => setN(v)} className="mt-1.5" aria-label="Side length" />
        </label>
        <p className="font-mono text-lg">
          {odds.map((o, i) => <span key={i} style={{ color: LAYER[i % LAYER.length] }}>{i ? ' + ' : ''}{o}</span>)} = <b>{n * n}</b>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Readout label={`${n}²`} value={`${n} × ${n} = ${n * n}`} />
          <Readout label="Next square" value={`${n * n} + ${2 * n + 1} = ${(n + 1) ** 2}`} />
        </div>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Each new layer wraps around the square as an L-shape: one row plus one column, sharing a corner. For side {n + 1}, that's {n} + {n + 1} = <b>{2 * n + 1}</b> dots, an odd number. So <b>every square number is a sum of consecutive odd numbers</b> starting at 1, and (n + 1)² − n² = n + (n + 1).</p>
      </div>
    </div>
  )
}

function Digits() {
  const [picked, setPicked] = useState<number | null>(null)
  const possible = picked !== null && SQUARE_ENDINGS.includes(picked % 10)
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="mx-auto text-center font-mono text-sm">
          <tbody>
            <tr><th className="px-2 text-left font-sans">n ends in</th>{Array.from({ length: 10 }, (_, d) => <td key={d} className="w-9 px-1">{d}</td>)}</tr>
            <tr><th className="px-2 text-left font-sans">n² ends in</th>{Array.from({ length: 10 }, (_, d) => <td key={d} className="w-9 px-1 font-bold text-chem">{lastDigit(d)}</td>)}</tr>
          </tbody>
        </table>
      </div>
      <p className="text-center text-sm">A perfect square can only end in <b>{SQUARE_ENDINGS.join(', ')}</b>. Never in <b>2, 3, 7 or 8</b>.</p>
      <p className="text-sm font-semibold">Could it be a perfect square? Tap a number:</p>
      <div className="flex flex-wrap gap-2">
        {CHECK.map((v) => (
          <button key={v} type="button" aria-pressed={picked === v} onClick={() => setPicked(v)} className={cn('rounded-lg border-2 px-3 py-1 font-mono', picked === v ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{v}</button>
        ))}
      </div>
      {picked !== null && (
        <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', isSquare(picked) ? 'bg-success-soft' : 'bg-warn-soft')}>
          {!possible
            ? <>❌ {picked} ends in {picked % 10}, so it <b>cannot</b> be a perfect square. No calculation needed!</>
            : isSquare(picked)
              ? <>✅ It ends in {picked % 10}, so it <i>might</i> be a square, and it is: {isqrt(picked)}² = {picked}.</>
              : <>🤔 It ends in {picked % 10}, so it <i>might</i> be a square, but it isn't: {isqrt(picked)}² = {isqrt(picked) ** 2} and {isqrt(picked) + 1}² = {(isqrt(picked) + 1) ** 2}. The last-digit test can rule numbers <b>out</b>, but never prove they're squares.</>}
        </p>
      )}
    </div>
  )
}
