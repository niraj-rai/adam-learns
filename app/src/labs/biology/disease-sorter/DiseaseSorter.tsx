import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { DISEASES, type Spread, SPREAD } from './model'

export default function DiseaseSorter() {
  const order = useMemo(() => shuffle(DISEASES), [])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Spread | null>(null)
  const [score, setScore] = useState(0)
  const d = order[i]
  const done = i >= order.length
  const choose = (s: Spread) => {
    if (picked) return
    setPicked(s)
    if (s === d.spread) { setScore((x) => x + 1); sfx.correct() } else sfx.wrong()
  }
  return (
    <LabFrame labId="disease-sorter" title="How Does It Spread?" subtitle="Communicable diseases pass from person to person; non-communicable ones don't. Knowing how a disease spreads tells us how to stop it." howTo={<p>For each disease, choose how it spreads (or whether it's not infectious at all). Then read how to prevent it.</p>}>
      {done ? (
        <div className="rounded-2xl border bg-success-soft p-6 text-center">
          <p className="font-heading text-2xl font-semibold">Sorted! {score} / {order.length} correct.</p>
          <Button className="mt-3" onClick={() => { setI(0); setScore(0); setPicked(null) }}>Play again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-background p-4 text-center">
            <p className="font-heading text-2xl font-semibold">{d.name}</p>
            {picked && <p className="text-sm text-muted-foreground">Caused by: {d.cause}</p>}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.keys(SPREAD) as Spread[]).map((s) => (
              <button key={s} type="button" disabled={Boolean(picked)} onClick={() => choose(s)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', !picked && 'hover:bg-muted', picked && s === d.spread && 'border-success bg-success-soft', picked === s && s !== d.spread && 'border-destructive bg-destructive/10')}>
                <span className="text-xl">{SPREAD[s].emoji}</span> {SPREAD[s].name}
              </button>
            ))}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl px-4 py-2 text-sm', picked === d.spread ? 'bg-success-soft' : 'bg-warn-soft')}>
              {picked === d.spread ? '✅ ' : `❌ ${d.name} spreads by: ${SPREAD[d.spread].name.toLowerCase()}. `}<b>{d.communicable ? 'Communicable' : 'Non-communicable'}.</b> Prevention: {SPREAD[d.spread].prevent}.
              <Button size="sm" className="ml-2" onClick={() => { setI((x) => x + 1); setPicked(null) }}>Next →</Button>
            </div>
          )}
          <Readout label="Score" value={`${score} / ${order.length}`} />
        </div>
      )}
    </LabFrame>
  )
}
