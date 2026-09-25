import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Mode, MODES, ORGANISMS } from './model'

export default function NutritionModes() {
  const order = useMemo(() => shuffle(ORGANISMS), [])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Mode | null>(null)
  const [score, setScore] = useState(0)
  const o = order[i]
  const finished = i >= order.length
  const choose = (m: Mode) => {
    if (picked) return
    setPicked(m)
    if (m === o.mode) { setScore((s) => s + 1); sfx.correct() } else sfx.wrong()
  }
  return (
    <LabFrame labId="nutrition-modes" title="Who Feeds How?" subtitle="Not every living thing gets its food the same way. Autotrophs make it; heterotrophs take it." howTo={<p>Read the clue about each organism and choose its mode of nutrition.</p>}>
      {finished ? (
        <div className="rounded-2xl border bg-success-soft p-6 text-center">
          <p className="font-heading text-2xl font-semibold">Done! {score} / {order.length} correct.</p>
          <Button className="mt-3" onClick={() => { setI(0); setScore(0); setPicked(null) }}>Play again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border bg-background p-4">
            <span className="text-5xl">{o.emoji}</span>
            <div><p className="font-heading text-xl font-semibold">{o.name}</p><p className="text-sm">{o.clue}</p></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button key={m} type="button" disabled={Boolean(picked)} onClick={() => choose(m)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', picked && m === o.mode && 'border-success bg-success-soft', picked === m && m !== o.mode && 'border-destructive bg-destructive/10', !picked && 'hover:bg-muted')}>
                <b>{m}</b><span className="block text-xs text-muted-foreground">{MODES[m]}</span>
              </button>
            ))}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl px-4 py-2 text-sm', picked === o.mode ? 'bg-success-soft' : 'bg-warn-soft')}>
              {picked === o.mode ? '✅ ' : `❌ It's ${o.mode.toLowerCase()}. `}{MODES[o.mode]}.
              <Button size="sm" className="ml-2" onClick={() => { setI((x) => x + 1); setPicked(null) }}>Next →</Button>
            </div>
          )}
          <Readout label="Score" value={`${score} / ${order.length}`} />
        </div>
      )}
    </LabFrame>
  )
}
