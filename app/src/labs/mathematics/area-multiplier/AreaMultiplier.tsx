import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { format, mul } from '../_shared/poly'

export default function AreaMultiplier() {
  const [tab, setTab] = useState<'numbers' | 'algebra'>('numbers')
  return (
    <LabFrame labId="area-multiplier" title="Area Multiplier" subtitle="We distribute, yet things multiply: split a rectangle to multiply numbers and expressions." howTo={<p>Numbers: split each number into tens and ones, and add the four areas. Algebra: do the same with (x + a)(x + b).</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['numbers', '🔢 Numbers'], ['algebra', '🔤 Algebra']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'numbers' ? <Numbers /> : <Algebra />}
    </LabFrame>
  )
}

const COLORS = ['#7dd3fc', '#86efac', '#fde68a', '#f9a8d4']

function Grid({ cols, rows, labels }: { cols: [string, number][]; rows: [string, number][]; labels: string[][] }) {
  const W = 420
  const H = 260
  const totalC = cols.reduce((s, [, v]) => s + v, 0)
  const totalR = rows.reduce((s, [, v]) => s + v, 0)
  let y = 30
  return (
    <svg viewBox={`0 0 ${W + 60} ${H + 40}`} className="w-full max-w-lg rounded-2xl border bg-background" role="img" aria-label="Area model">
      {(() => { let x = 50; return cols.map(([l, v], i) => { const w = (v / totalC) * W; const el = <text key={i} x={x + w / 2} y={20} textAnchor="middle" fontSize={14} fontWeight={700} fill="currentColor">{l}</text>; x += w; return el }) })()}
      {rows.map(([rl, rv], r) => {
        const h = (rv / totalR) * H
        let x = 50
        const g = (
          <g key={r}>
            <text x={40} y={y + h / 2 + 5} textAnchor="end" fontSize={14} fontWeight={700} fill="currentColor">{rl}</text>
            {cols.map(([, cv], c) => {
              const w = (cv / totalC) * W
              const cell = (
                <g key={c}>
                  <rect x={x} y={y} width={w} height={h} fill={COLORS[(r * 2 + c) % 4]} stroke="#334155" />
                  <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize={Math.min(15, Math.max(9, Math.min(w, h) / 3))} fontWeight={600} fill="#0f172a">{labels[r][c]}</text>
                </g>
              )
              x += w
              return cell
            })}
          </g>
        )
        y += h
        return g
      })}
    </svg>
  )
}

function Numbers() {
  const [a, setA] = useState(23)
  const [b, setB] = useState(47)
  const [at, ao] = [Math.floor(a / 10) * 10, a % 10]
  const [bt, bo] = [Math.floor(b / 10) * 10, b % 10]
  const parts = [[bt * at, bo * at], [bt * ao, bo * ao]]
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">First number <b>{a}</b><Slider value={[a]} min={11} max={99} step={1} onValueChange={([v]) => setA(v)} className="mt-1.5" aria-label="First number" /></label>
        <label className="text-sm">Second number <b>{b}</b><Slider value={[b]} min={11} max={99} step={1} onValueChange={([v]) => setB(v)} className="mt-1.5" aria-label="Second number" /></label>
      </div>
      <Grid cols={[[`${bt}`, Math.max(bt, 1)], [`${bo}`, Math.max(bo, 1)]]} rows={[[`${at}`, Math.max(at, 1)], [`${ao}`, Math.max(ao, 1)]]} labels={parts.map((row) => row.map((v) => `${v}`))} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="Distribute" value={`(${at} + ${ao}) × (${bt} + ${bo})`} />
        <Readout label="Add the four areas" value={`${parts.flat().join(' + ')} = ${a * b}`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Every part of the first number multiplies every part of the second. That's the <b>distributive property</b>, and it's exactly what column multiplication does behind the scenes.</p>
    </div>
  )
}

function Algebra() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(2)
  const X = 6
  const sg = (v: number) => (v < 0 ? `− ${-v}` : `+ ${v}`)
  const num = (v: number) => (v < 0 ? `−${-v}` : `${v}`)
  const term = (v: number) => (v === 0 ? '0' : `${v === 1 ? '' : v === -1 ? '−' : num(v)}x`)
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">a = <b>{a}</b><Slider value={[a]} min={-6} max={6} step={1} onValueChange={([v]) => setA(v)} className="mt-1.5" aria-label="a" /></label>
        <label className="text-sm">b = <b>{b}</b><Slider value={[b]} min={-6} max={6} step={1} onValueChange={([v]) => setB(v)} className="mt-1.5" aria-label="b" /></label>
      </div>
      <Grid cols={[['x', X], [num(b), Math.max(Math.abs(b), 0.6)]]} rows={[['x', X], [num(a), Math.max(Math.abs(a), 0.6)]]} labels={[['x²', term(b)], [term(a), num(a * b)]]} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Readout label="Multiply" value={`(x ${sg(a)})(x ${sg(b)})`} />
        <Readout label="Expand" value={format(mul([a, 1], [b, 1]))} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The four parts are x², {term(b)}, {term(a)} and {num(a * b)}. The two middle terms are like terms, so they combine: {term(a)} {b >= 0 ? '+' : '−'} {term(Math.abs(b))} = {term(a + b)}. So (x + a)(x + b) = x² + (a + b)x + ab. {(a < 0 || b < 0) && 'Negative lengths can’t really be drawn: here the areas are just labelled with their signs.'}</p>
    </div>
  )
}
