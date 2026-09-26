import { useState } from 'react'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { format } from '../_shared/poly'
import { productPairs, splitMiddle } from './model'

const QUADS: [number, number][] = [[5, 6], [7, 12], [6, 9], [8, 15], [-1, -6], [2, -8], [-5, 4], [0, -9], [-7, 10]]
const num = (v: number) => (v < 0 ? `−${-v}` : `${v}`)
const bracket = (m: number) => (m === 0 ? 'x' : `(x ${m < 0 ? '−' : '+'} ${Math.abs(m)})`)

export default function FactorRectangle() {
  const [qi, setQi] = useState(0)
  const [b, c] = QUADS[qi]
  const [pick, setPick] = useState<[number, number] | null>(null)
  const answer = splitMiddle(b, c)
  const good = pick !== null && pick[0] + pick[1] === b
  const choose = (p: [number, number]) => {
    setPick(p)
    if (p[0] + p[1] === b) sfx.correct()
    else sfx.wrong()
  }
  const S = 18
  const X = 120
  return (
    <LabFrame labId="factor-rectangle" title="Factor Rectangle" subtitle="Factorising is multiplying backwards: find the rectangle hiding in x² + bx + c." howTo={<p>Choose an expression. Its number c must be the product of two numbers m and n, and b must be their sum. Try the pairs until the rectangle fits.</p>}>
      <div className="flex flex-wrap gap-1">
        {QUADS.map(([bb, cc], i) => (
          <button key={i} type="button" aria-pressed={qi === i} onClick={() => { setQi(i); setPick(null) }} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', qi === i ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{format([cc, bb, 1])}</button>
        ))}
      </div>
      <p className="mt-3 text-sm">Pairs of numbers that multiply to make <b>{num(c)}</b>. Which pair adds up to <b>{num(b)}</b>?</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {productPairs(c).map((p) => (
          <button key={p.join()} type="button" onClick={() => choose(p)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', pick?.join() === p.join() ? (good ? 'border-success bg-success-soft' : 'border-destructive/60 bg-destructive/10') : 'hover:bg-muted')}>{num(p[0])} × {num(p[1])} (sum {num(p[0] + p[1])})</button>
        ))}
      </div>
      {good && pick && (
        <svg viewBox={`0 0 ${X + Math.abs(pick[1]) * S + 60} ${X + Math.abs(pick[0]) * S + 50}`} className="mt-3 w-full max-w-md rounded-2xl border bg-background" role="img" aria-label={`Rectangle ${bracket(pick[0])} by ${bracket(pick[1])}`}>
          <rect x={40} y={30} width={X} height={X} fill="#7dd3fc" stroke="#334155" />
          <text x={40 + X / 2} y={30 + X / 2 + 5} textAnchor="middle" fontSize={16} fontWeight={700}>x²</text>
          {pick[1] !== 0 && <><rect x={40 + X} y={30} width={Math.abs(pick[1]) * S} height={X} fill={pick[1] < 0 ? '#fca5a5' : '#86efac'} stroke="#334155" /><text x={40 + X + (Math.abs(pick[1]) * S) / 2} y={30 + X / 2 + 5} textAnchor="middle" fontSize={12} fontWeight={700}>{num(pick[1])}x</text></>}
          {pick[0] !== 0 && <><rect x={40} y={30 + X} width={X} height={Math.abs(pick[0]) * S} fill={pick[0] < 0 ? '#fca5a5' : '#86efac'} stroke="#334155" /><text x={40 + X / 2} y={30 + X + (Math.abs(pick[0]) * S) / 2 + 5} textAnchor="middle" fontSize={12} fontWeight={700}>{num(pick[0])}x</text></>}
          {pick[0] !== 0 && pick[1] !== 0 && <><rect x={40 + X} y={30 + X} width={Math.abs(pick[1]) * S} height={Math.abs(pick[0]) * S} fill={pick[0] * pick[1] < 0 ? '#fca5a5' : '#fde68a'} stroke="#334155" /><text x={40 + X + (Math.abs(pick[1]) * S) / 2} y={30 + X + (Math.abs(pick[0]) * S) / 2 + 5} textAnchor="middle" fontSize={11} fontWeight={700}>{num(pick[0] * pick[1])}</text></>}
          <text x={40 + (X + Math.abs(pick[1]) * S) / 2} y={20} textAnchor="middle" fontSize={13} fill="currentColor">{bracket(pick[1])}</text>
          <text x={30} y={30 + (X + Math.abs(pick[0]) * S) / 2} textAnchor="end" fontSize={13} fill="currentColor" transform={`rotate(-90 30 ${30 + (X + Math.abs(pick[0]) * S) / 2})`}>{bracket(pick[0])}</text>
        </svg>
      )}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Expression" value={format([c, b, 1])} />
        <Readout label="Factorised" value={good && pick ? `${bracket(pick[0])}${bracket(pick[1])}` : '?'} />
      </div>
      <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', good ? 'bg-success-soft' : 'bg-chem-soft')}>
        {good && pick
          ? <>✅ {num(pick[0])} × {num(pick[1])} = {num(c)} and {num(pick[0])} + {num(pick[1])} = {num(b)}. So {format([c, b, 1])} = <b>{bracket(pick[0])}{bracket(pick[1])}</b>. Check by expanding it!{b === 0 && ' This one is a difference of squares: x² − 9 = (x + 3)(x − 3).'}</>
          : pick
            ? <>❌ {num(pick[0])} × {num(pick[1])} = {num(c)}, but {num(pick[0])} + {num(pick[1])} = {num(pick[0] + pick[1])}, not {num(b)}. Try another pair.</>
            : <>Expanding (x + m)(x + n) gives x² + (m + n)x + mn. So to factorise, look for two numbers that <b>multiply to {num(c)}</b> and <b>add to {num(b)}</b>.{answer ? '' : ' (This one has no whole-number answer.)'}</>}
      </p>
    </LabFrame>
  )
}
