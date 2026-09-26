import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { evaluate, format, type Poly } from '../_shared/poly'

type Kind = 0 | 1 | 2 // 1, x, x²
type Counts = { pos: [number, number, number]; neg: [number, number, number] }
const EMPTY: Counts = { pos: [0, 0, 0], neg: [0, 0, 0] }
const LABEL = ['1', 'x', 'x²']

const CHALLENGES: { show: string; target: Poly }[] = [
  { show: '3x + 2 − x + 5', target: [7, 2] },
  { show: 'x² + 4x − 2x − 3', target: [-3, 2, 1] },
  { show: '2x² − 5 + x − x² + 5', target: [0, 1, 1] },
  { show: '4 − 3x + 2x − 6', target: [-2, -1] },
  { show: '2(x + 3) − x', target: [6, 1] },
]

function Tile({ kind, neg }: { kind: Kind; neg: boolean }) {
  const size = kind === 2 ? 'h-14 w-14' : kind === 1 ? 'h-14 w-4' : 'h-4 w-4'
  return <span className={cn('inline-grid place-items-center rounded-sm border text-[9px] font-bold', size, neg ? 'border-red-700 bg-red-400/80 text-red-950' : kind === 2 ? 'border-sky-700 bg-sky-400/80' : kind === 1 ? 'border-emerald-700 bg-emerald-400/80' : 'border-amber-700 bg-amber-300')} aria-hidden>{kind === 2 ? (neg ? '−x²' : 'x²') : ''}</span>
}

export default function AlgebraTiles() {
  const [c, setC] = useState<Counts>(EMPTY)
  const [x, setX] = useState(2)
  const [ch, setCh] = useState(0)
  const simplified: Poly = [0, 1, 2].map((k) => c.pos[k] - c.neg[k])
  const unsimplified = ([2, 1, 0] as Kind[]).flatMap((k) => [
    ...Array(c.pos[k]).fill(`+ ${LABEL[k]}`),
    ...Array(c.neg[k]).fill(`− ${LABEL[k]}`),
  ]).join(' ').replace(/^\+ /, '').replace(/^− /, '−') || '0'
  const target = CHALLENGES[ch].target
  const solved = format(simplified) === format(target)
  const change = (k: Kind, sign: 1 | -1) => {
    const next: Counts = { pos: [...c.pos] as Counts['pos'], neg: [...c.neg] as Counts['neg'] }
    if (sign > 0) next.pos[k] = Math.min(9, next.pos[k] + 1)
    else next.neg[k] = Math.min(9, next.neg[k] + 1)
    setC(next)
    const s: Poly = [0, 1, 2].map((i) => next.pos[i] - next.neg[i])
    if (format(s) === format(target)) sfx.correct()
    else sfx.click()
  }
  const zeroPairs = () => setC((prev) => {
    const pos = prev.pos.map((p, i) => p - Math.min(p, prev.neg[i])) as Counts['pos']
    const neg = prev.neg.map((n, i) => n - Math.min(n, prev.pos[i])) as Counts['neg']
    return { pos, neg }
  })
  return (
    <LabFrame labId="algebra-tiles" title="Algebra Tiles" subtitle="Build expressions with tiles, cancel zero pairs and collect like terms." howTo={<p>Add tiles with the buttons: blue x², green x, yellow 1, red for negatives. A positive and a negative tile of the same kind make a zero pair. Build the simplified form of the challenge expression.</p>}>
      <div className="rounded-2xl bg-muted/50 p-3 text-sm">
        <p className="font-semibold">Challenge {ch + 1}/{CHALLENGES.length}: simplify <span className="font-mono">{CHALLENGES[ch].show}</span> by building it with tiles.</p>
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setCh((ch + 1) % CHALLENGES.length); setC(EMPTY) }}>Next challenge →</Button>
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {([2, 1, 0] as Kind[]).map((k) => (
          <div key={k} className="flex items-center justify-center gap-1 rounded-xl border p-2">
            <Button size="sm" variant="outline" onClick={() => change(k, 1)} aria-label={`Add ${LABEL[k]}`}>+{LABEL[k]}</Button>
            <Button size="sm" variant="outline" onClick={() => change(k, -1)} aria-label={`Add −${LABEL[k]}`}>−{LABEL[k]}</Button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex min-h-24 flex-wrap items-end gap-1.5 rounded-2xl border bg-background p-3" aria-label="Tile mat">
        {([2, 1, 0] as Kind[]).flatMap((k) => [
          ...Array.from({ length: c.pos[k] }, (_, i) => <Tile key={`p${k}${i}`} kind={k} neg={false} />),
          ...Array.from({ length: c.neg[k] }, (_, i) => <Tile key={`n${k}${i}`} kind={k} neg />),
        ])}
        {unsimplified === '0' && <p className="text-sm text-muted-foreground">Your tiles appear here.</p>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="outline" onClick={zeroPairs}>Remove zero pairs</Button>
        <Button variant="ghost" onClick={() => setC(EMPTY)}>Clear</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Tiles say" value={unsimplified} />
        <Readout label="Simplified" value={format(simplified)} />
        <Readout label={`Value when x = ${x}`} value={`${evaluate(simplified, x)}`} />
      </div>
      <label className="mt-2 block text-sm">x = <b>{x}</b><Slider value={[x]} min={-5} max={5} step={1} onValueChange={([v]) => setX(v)} className="mt-1" aria-label="Value of x" /></label>
      <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', solved ? 'bg-success-soft' : 'bg-chem-soft')}>
        {solved
          ? <>✅ {CHALLENGES[ch].show} = <b>{format(target)}</b>. You collected <b>like terms</b>: x² tiles with x² tiles, x with x, numbers with numbers. They can't combine across kinds, just like apples and oranges.</>
          : <>Only <b>like terms</b> combine: 3x and −x make 2x, but x and x² stay separate. A tile and its red opposite cancel to zero.</>}
      </p>
    </LabFrame>
  )
}
