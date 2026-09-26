import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { sup } from '../_shared/number'
import { sci } from '../scale-of-universe/model'
import { foldsToReach, formatLength, LANDMARKS, SHEET, thickness } from './model'

export default function PaperFold() {
  const [n, setN] = useState(0)
  const t = thickness(n)
  const next = LANDMARKS.find((l) => t < l.m)
  const fold = (v: number) => {
    const before = LANDMARKS.filter((l) => thickness(n) >= l.m).length
    const after = LANDMARKS.filter((l) => thickness(v) >= l.m).length
    setN(v)
    if (after > before) sfx.correct()
    else sfx.click()
  }
  return (
    <LabFrame labId="paper-fold" title="Paper Fold to the Moon" subtitle="Each fold doubles the thickness. How many folds would reach the Moon?" howTo={<p>Fold the (imaginary) sheet of paper, 0.1 mm thick, and watch the stack grow. Predict how many folds each landmark needs before you get there.</p>}>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => fold(Math.min(50, n + 1))} disabled={n >= 50}>📄 Fold!</Button>
        <Button variant="outline" onClick={() => fold(0)}>Unfold</Button>
        <label className="ml-2 min-w-48 flex-1 text-sm">Folds: <b>{n}</b>
          <Slider value={[n]} min={0} max={50} step={1} onValueChange={([v]) => fold(v)} className="mt-1.5" aria-label="Number of folds" />
        </label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Layers" value={`2${sup(n)} = ${(2 ** n).toLocaleString('en-IN')}`} />
        <Readout label="Thickness" value={formatLength(t)} />
        <Readout label="In standard form" value={`${sci(t, 3)} m`} />
      </div>
      <div className="mt-3 space-y-1.5">
        {LANDMARKS.map((l) => {
          const need = foldsToReach(l.m)
          const reached = t >= l.m
          const pct = Math.min(100, (Math.log2(t / SHEET) / Math.log2(l.m / SHEET)) * 100)
          return (
            <div key={l.name} className="flex items-center gap-2 text-sm">
              <span className="w-44 shrink-0 truncate">{l.emoji} {l.name}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full rounded-full transition-all', reached ? 'bg-success' : 'bg-chem')} style={{ width: `${Math.max(0, pct)}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">{reached ? `✅ fold ${need}` : `${formatLength(l.m)}`}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {next
          ? <>Next stop: <b>{next.name}</b>. Predict how many more folds it takes, then check! Bars show folds so far compared with folds needed.</>
          : <>You passed the Sun! Doubling grows so fast that {n} folds of a paper sheet would be {formatLength(t)} thick.</>}
        {' '}In real life, paper gets too thick to fold after about 7 folds (the record is 12, set with a very long sheet of toilet paper). But the maths is real: this is <b>exponential growth</b>, 0.1 mm × 2ⁿ.
      </p>
    </LabFrame>
  )
}
