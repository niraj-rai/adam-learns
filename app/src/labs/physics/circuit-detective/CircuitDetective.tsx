import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { CircuitLoop } from '../circuit-builder/CircuitLoop'
import { evaluate } from '../circuit-builder/model'
import { CASES, fixedParts } from './model'

export default function CircuitDetective() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [round, setRound] = useState(0)
  const order = useMemo(() => CASES.map((c) => ({ ...c, opts: shuffle(c.options.map((o, i) => ({ o, ok: i === c.answer }))) })), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<{ o: string; ok: boolean } | null>(null)
  const done = i >= order.length
  const c = order[Math.min(i, order.length - 1)]
  const parts = picked?.ok ? fixedParts(c) : c.parts
  const r = evaluate(parts)

  const choose = (x: { o: string; ok: boolean }) => {
    if (picked) return
    setPicked(x)
    if (x.ok) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setPicked(null)
    if (n >= order.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('circuit-detective')) addXp(25 + hearts * 10, 'Circuit Detective!')
      awardBadge('circuit-detective')
    }
  }
  const restart = () => { setRound((x) => x + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="circuit-detective" title="Boss Challenge: Circuit Detective" subtitle="Seven broken circuits. Find the fault in each and fix it!" howTo={<p>Read the clue, study the circuit diagram and choose the fault. Get it right and the circuit is repaired before your eyes. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Case {Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🕵️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Case closed, Detective! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="mt-2 font-heading text-xl font-semibold">Out of lives. Review the Circuit Builder and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="font-heading text-xl font-semibold">🔎 {c.title}</p>
            <p className="text-[15px]">{c.story}</p>
          </div>
          <CircuitLoop parts={parts} result={r} label={`Case circuit: ${r.reason === 'works' ? 'working' : 'not working'}`} />
          <div className="grid gap-2 sm:grid-cols-2">
            {c.opts.map((x) => (
              <button key={x.o} type="button" disabled={Boolean(picked)} onClick={() => choose(x)} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left text-sm', !picked && 'hover:border-chem', picked && x.ok && 'border-success bg-success-soft', picked === x && !x.ok && 'border-destructive/60 bg-destructive/10', picked && picked !== x && !x.ok && 'opacity-50')}>{x.o}</button>
            ))}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl p-4 text-sm', picked.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked.ok ? '✅ Fixed! ' : '❌ Not that. '}{c.explain}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < order.length ? 'Next case →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
