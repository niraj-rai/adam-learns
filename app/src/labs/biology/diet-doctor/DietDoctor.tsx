import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { CASES } from './model'

export default function DietDoctor() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(CASES).map((c) => ({ ...c, options: shuffle(c.options) })), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<string | null>(null)
  const done = i >= order.length
  const c = order[Math.min(i, order.length - 1)]
  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === c.answer) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n); setPicked(null)
    if (n >= order.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('diet-doctor')) addXp(25 + hearts * 10, 'Diet Doctor!')
      awardBadge('diet-doctor')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }
  return (
    <LabFrame labId="diet-doctor" title="Boss Challenge: Diet Doctor" subtitle="Six patients have come to your clinic. Diagnose each deficiency and prescribe the right foods." howTo={<p>Read each patient's symptoms and choose the most likely cause. A wrong diagnosis costs a ❤️. (This is a science game, not medical advice. Real patients should always see a doctor.)</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Patient {Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🩺</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Clinic closed: all patients on the road to health! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Review the balanced-diet lesson and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="font-heading text-lg font-semibold">🧑‍⚕️ {c.patient}</p>
            <p className="text-[15px]"><b>Symptoms:</b> {c.symptoms}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.options.map((o) => (
              <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o === c.answer && 'border-success bg-success-soft', picked === o && o !== c.answer && 'border-destructive/60 bg-destructive/10')}>{o}</button>
            ))}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl p-4 text-sm', picked === c.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked === c.answer ? '✅ ' : `❌ It's ${c.answer.toLowerCase()}. `}{c.why}</p>
              <p className="mt-1"><b>Prescription:</b> {c.foods.join(' · ')}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < order.length ? 'Next patient →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
