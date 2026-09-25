import { motion } from 'motion/react'
import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CHECKPOINTS } from './model'

export default function MarathonMedic() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<string | null>(null)
  const done = i >= CHECKPOINTS.length
  const c = CHECKPOINTS[Math.min(i, CHECKPOINTS.length - 1)]
  const data = CHECKPOINTS.slice(0, Math.min(i, CHECKPOINTS.length - 1) + 1).map((x) => ({ km: x.km, heart: x.heart, breaths: x.breaths }))
  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === c.answer) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n); setPicked(null)
    if (n >= CHECKPOINTS.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('marathon-medic')) addXp(25 + hearts * 10, 'Marathon Medic!')
      awardBadge('marathon-medic')
    }
  }
  const restart = () => { setI(0); setHearts(3); setPicked(null) }
  return (
    <LabFrame labId="marathon-medic" title="Boss Challenge: Marathon Medic" subtitle="You're the medic following a runner through a half marathon. Read the body's signals and explain what the systems are doing." howTo={<p>At each checkpoint, study the runner's readings and the graph, then answer. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Checkpoint {Math.min(i + 1, CHECKPOINTS.length)} / {CHECKPOINTS.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏅</p>
          <p className="mt-2 font-heading text-2xl font-semibold">The runner finished safely, thanks to you! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <p className="text-sm">Breathing, circulation, excretion, muscles and skin all worked together as one team.</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Run again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Review the body-systems labs and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Readout label={`At ${c.km} km: heart`} value={`${c.heart} bpm`} />
            <Readout label="Breathing" value={`${c.breaths} / min`} />
            <Readout label="Body temperature" value={`${c.tempC} °C`} />
            <Readout label="Sweat lost" value={`${c.sweatL} L`} />
          </div>
          <div className="h-40 rounded-xl border p-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="km" type="number" domain={[0, 21]} tick={{ fontSize: 10 }} unit=" km" />
                <YAxis domain={[0, 180]} tick={{ fontSize: 10 }} width={30} />
                <Tooltip />
                <Line dataKey="heart" name="Heart rate" stroke="#ef4444" strokeWidth={2} isAnimationActive={false} />
                <Line dataKey="breaths" name="Breaths/min" stroke="#3b82f6" strokeWidth={2} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="rounded-2xl bg-muted/50 p-3 font-semibold">🩺 {c.question}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {c.options.map((o) => <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o === c.answer && 'border-success bg-success-soft', picked === o && o !== c.answer && 'border-destructive/60 bg-destructive/10')}>{o}</button>)}
          </div>
          {picked && (
            <div role="status" className={cn('rounded-xl p-3 text-sm', picked === c.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked === c.answer ? '✅ ' : '❌ '}{c.why}</p>
              {hearts > 0 ? <Button className="mt-2" autoFocus onClick={next}>{i + 1 < CHECKPOINTS.length ? 'Next checkpoint →' : 'Finish'}</Button> : <Button className="mt-2" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
