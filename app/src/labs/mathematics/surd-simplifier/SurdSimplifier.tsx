import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { simplifySurd } from '../_shared/real'

const surd = (a: number, b: number) => (b === 1 ? `${a}` : a === 1 ? `√${b}` : `${a}√${b}`)
const QUIZ = [8, 12, 18, 20, 27, 32, 45, 48, 50, 72, 75, 98, 200]

export default function SurdSimplifier() {
  const [tab, setTab] = useState<'simplify' | 'rationalise' | 'quiz'>('simplify')
  const [n, setN] = useState(72)
  const [ra, setRa] = useState(5)
  const [rb, setRb] = useState(3)
  const [qi, setQi] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [a, b] = simplifySurd(n)
  const square = a * a
  const qn = QUIZ[qi % QUIZ.length]
  const [qa, qb] = simplifySurd(qn)
  const options = useMemo(() => shuffle([surd(qa, qb), surd(qb, qa), surd(1, qn), surd(qa + 1, qb)].filter((x, i, arr) => arr.indexOf(x) === i)), [qn, qa, qb])
  const choose = (o: string) => { if (picked) return; setPicked(o); if (o === surd(qa, qb)) { sfx.correct(); setScore((s) => s + 1) } else sfx.wrong() }
  return (
    <LabFrame labId="surd-simplifier" title="Surd Simplifier" subtitle="Simplify square roots by taking out square factors, and rationalise denominators." howTo={<p>Simplify: find the biggest square factor. Rationalise: multiply top and bottom by the conjugate. Then try the quiz.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['simplify', '√ Simplify'], ['rationalise', '÷ Rationalise'], ['quiz', '🎯 Quiz']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      {tab === 'simplify' && (
        <div className="mt-3 space-y-3">
          <label className="block text-sm">Simplify √<b>{n}</b><Slider value={[n]} min={2} max={200} step={1} onValueChange={([v]) => setN(v)} className="mt-1" aria-label="number under the root" /></label>
          <div className="rounded-2xl border p-4 font-mono text-lg">
            {square > 1 ? <>√{n} = √({square} × {b}) = √{square} × √{b} = <b className="text-chem">{surd(a, b)}</b></> : b === n ? <>√{n} has no square factor bigger than 1, so it is already simplest.</> : null}
            {b === 1 && <> · {n} is a perfect square!</>}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Readout label="Biggest square factor" value={square} />
            <Readout label="Simplest form" value={surd(a, b)} />
            <Readout label="Decimal check" value={`${Math.sqrt(n).toFixed(4)} = ${(a * Math.sqrt(b)).toFixed(4)}`} />
          </div>
        </div>
      )}
      {tab === 'rationalise' && (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">a = <b>{ra}</b><Slider value={[ra]} min={2} max={12} step={1} onValueChange={([v]) => setRa(v)} className="mt-1" aria-label="a" /></label>
            <label className="text-sm">b = <b>{rb}</b><Slider value={[rb]} min={1} max={11} step={1} onValueChange={([v]) => setRb(v)} className="mt-1" aria-label="b" /></label>
          </div>
          {ra === rb ? <p className="text-sm">Choose a ≠ b.</p> : (
            <div className="space-y-2 rounded-2xl border p-4 font-mono">
              <p>1 ÷ (√{ra} + √{rb})</p>
              <p>= (√{ra} − √{rb}) ÷ [(√{ra} + √{rb})(√{ra} − √{rb})]</p>
              <p>= (√{ra} − √{rb}) ÷ ({ra} − {rb})</p>
              <p className="text-chem">= (√{ra} − √{rb}) ÷ {ra - rb}</p>
              <p className="text-xs text-muted-foreground">Check: {(1 / (Math.sqrt(ra) + Math.sqrt(rb))).toFixed(5)} = {((Math.sqrt(ra) - Math.sqrt(rb)) / (ra - rb)).toFixed(5)}</p>
            </div>
          )}
          <p className="text-sm">We use the identity (x + y)(x − y) = x² − y². Multiplying by the <b>conjugate</b> √{ra} − √{rb} turns the denominator into a whole number.</p>
        </div>
      )}
      {tab === 'quiz' && (
        <div className="mt-3 space-y-3">
          <p className="font-heading text-xl">Simplify √{qn}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 px-4 py-2 text-left font-mono text-lg', picked && o === surd(qa, qb) && 'border-success bg-success-soft', picked === o && o !== surd(qa, qb) && 'border-destructive/60 bg-destructive/10')}>{o}</button>)}
          </div>
          {picked && <div className="flex items-center gap-3 text-sm"><span>{picked === surd(qa, qb) ? '✅' : '❌'} √{qn} = √({qa * qa} × {qb}) = {surd(qa, qb)}</span><Button size="sm" onClick={() => { setQi((i) => i + 1); setPicked(null) }}>Next →</Button></div>}
          <p className="text-xs text-muted-foreground">Score {score}</p>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Rules for surds: √a × √b = √(ab), √a ÷ √b = √(a/b), and you can only add like surds: 2√3 + 5√3 = 7√3, but √2 + √3 can't be simplified.</p>
    </LabFrame>
  )
}
