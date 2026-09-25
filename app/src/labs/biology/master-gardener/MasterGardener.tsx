import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { TASKS } from './model'

export default function MasterGardener() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [round, setRound] = useState(0)
  const order = useMemo(() => TASKS.map((t) => ({ ...t, options: shuffle(t.options) })), [round])
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<string | null>(null)
  const done = i >= order.length
  const t = order[Math.min(i, order.length - 1)]
  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === t.answer) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n); setPicked(null)
    if (n >= order.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('master-gardener')) addXp(25 + hearts * 10, 'Master Gardener!')
      awardBadge('master-gardener')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }
  return (
    <LabFrame labId="master-gardener" title="Boss Challenge: Master Gardener" subtitle="Run the school garden for a year. Use what you know about how plants reproduce to solve six problems." howTo={<p>Read each garden problem and choose the best solution. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Task {Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌻</p>
          <p className="mt-2 font-heading text-2xl font-semibold">The garden is blooming, Master Gardener! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">The garden needs more care. Review the unit's labs and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4"><span className="text-5xl">{t.emoji}</span><p className="font-heading text-lg font-semibold">{t.goal}</p></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {t.options.map((o) => <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o === t.answer && 'border-success bg-success-soft', picked === o && o !== t.answer && 'border-destructive/60 bg-destructive/10')}>{o}</button>)}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl p-3 text-sm', picked === t.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked === t.answer ? '✅ ' : '❌ '}{t.why}</p>
              {hearts > 0 ? <Button className="mt-2" autoFocus onClick={next}>{i + 1 < order.length ? 'Next task →' : 'Finish'}</Button> : <Button className="mt-2" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
