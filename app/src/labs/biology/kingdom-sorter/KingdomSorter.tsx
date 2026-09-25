import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CLASSES, KINGDOMS, LIVING } from './model'

export default function KingdomSorter() {
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(LIVING), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [stage, setStage] = useState<'kingdom' | 'class' | 'done'>('kingdom')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [firstTry, setFirstTry] = useState(true)
  const l = order[i]
  const finished = i >= order.length

  const pickKingdom = (k: string) => {
    if (k === l.kingdom) {
      sfx.correct()
      if (l.kingdom === 'Animals') { setStage('class'); setFeedback(`✅ An animal. Now, is it a vertebrate (has a backbone)? If so, which class?`) }
      else { if (firstTry) setScore((s) => s + 1); setStage('done'); setFeedback(`✅ ${l.why}`) }
    } else { sfx.wrong(); setFirstTry(false); setFeedback(`❌ Not ${k}. Think about how it gets its food and whether it is made of one cell or many.`) }
  }
  const pickClass = (c: string) => {
    const ok = c === (l.vertebrateClass ?? 'Invertebrate')
    if (ok) { sfx.correct(); if (firstTry) setScore((s) => s + 1); setStage('done'); setFeedback(`✅ ${l.why}`) }
    else { sfx.wrong(); setFirstTry(false); setFeedback(`❌ Not ${c.toLowerCase()}. Look at its skin covering, how it breathes and how its young are born.`) }
  }
  const next = () => { setI((x) => x + 1); setStage('kingdom'); setFeedback(null); setFirstTry(true) }

  return (
    <LabFrame labId="kingdom-sorter" title="Kingdom Sorter" subtitle="Every living thing belongs to a kingdom. Animals with backbones split further into five classes." howTo={<p>Sort each organism into its kingdom. If it's an animal, decide whether it's an invertebrate or which vertebrate class it belongs to.</p>}>
      {finished ? (
        <div className="rounded-2xl border bg-success-soft p-6 text-center">
          <p className="font-heading text-2xl font-semibold">All sorted! {score} / {order.length} right first time.</p>
          <Button className="mt-3" onClick={() => { setRound((r) => r + 1); setI(0); setScore(0); setFirstTry(true); setStage('kingdom'); setFeedback(null) }}>Play again</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-col items-center rounded-2xl border bg-background p-4">
            <span className="text-6xl">{l.emoji}</span>
            <p className="font-heading text-xl font-semibold">{l.name}</p>
          </div>
          {stage === 'kingdom' && <div className="flex flex-wrap justify-center gap-2">{KINGDOMS.map((k) => <Button key={k} variant="outline" onClick={() => pickKingdom(k)}>{k}</Button>)}</div>}
          {stage === 'class' && <div className="flex flex-wrap justify-center gap-2">{[...CLASSES, 'Invertebrate'].map((c) => <Button key={c} variant="outline" onClick={() => pickClass(c)}>{c}</Button>)}</div>}
          {feedback && <p role="status" className={cn('rounded-xl px-4 py-2 text-sm', feedback.startsWith('❌') ? 'bg-warn-soft' : 'bg-success-soft')}>{feedback}</p>}
          {stage === 'done' && <Button onClick={next}>Next organism →</Button>}
          <Readout label="Progress" value={`${i + 1} / ${order.length}`} />
        </div>
      )}
    </LabFrame>
  )
}
