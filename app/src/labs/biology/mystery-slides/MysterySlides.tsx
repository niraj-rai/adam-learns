import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { OBJECTIVES } from '../virtual-microscope/model'
import { EyepieceView } from '../virtual-microscope/VirtualMicroscope'
import { SLIDES } from './model'

export default function MysterySlides() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [round, setRound] = useState(0)
  const order = useMemo(() => shuffle(SLIDES).map((s) => ({ ...s, options: shuffle(s.options) })), [round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0)
  const [objective, setObjective] = useState(10)
  const [focus, setFocus] = useState(10)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<string | null>(null)
  const done = i >= order.length
  const s = order[Math.min(i, order.length - 1)]
  const choose = (o: string) => {
    if (picked) return
    setPicked(o)
    if (o === s.answer) sfx.correct()
    else { sfx.wrong(); setHearts((h) => h - 1) }
  }
  const next = () => {
    const n = i + 1
    setI(n); setPicked(null); setFocus(10); setObjective(10)
    if (n >= order.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('slide-sleuth')) addXp(25 + hearts * 10, 'Slide Sleuth!')
      awardBadge('slide-sleuth')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null); setFocus(10); setObjective(10) }

  return (
    <LabFrame labId="mystery-slides" title="Boss Challenge: Mystery Slides" subtitle="Six unlabelled slides have arrived at the lab. Focus the microscope and identify each one." howTo={<p>Each slide is already stained. Choose an objective lens and focus until the image is sharp. Some cells need high power! Then identify the slide. A wrong answer costs a ❤️.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(Math.max(0, hearts))}{'🤍'.repeat(3 - Math.max(0, hearts))}</span>
        <span className="text-sm text-muted-foreground">Slide {Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🔬</p>
          <p className="mt-2 font-heading text-2xl font-semibold">All slides identified, Sleuth! {'⭐'.repeat(Math.max(0, hearts))}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : hearts <= 0 && !picked ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-heading text-xl font-semibold">Out of lives. Practise with the Virtual Microscope and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-[320px_1fr]">
          <div className="grid place-items-center"><EyepieceView id={s.specimen} objective={objective} focus={focus} stained label={`Mystery slide ${i + 1}`} /></div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">{OBJECTIVES.map((o) => <Button key={o} size="sm" variant={o === objective ? 'default' : 'outline'} onClick={() => setObjective(o)}>{o}×</Button>)}</div>
            <label className="block text-sm">Focus: <b>{focus}</b>
              <Slider value={[focus]} min={0} max={100} step={1} onValueChange={([v]) => setFocus(v)} className="mt-1.5" aria-label="Focus" />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {s.options.map((o) => (
                <button key={o} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o === s.answer && 'border-success bg-success-soft', picked === o && o !== s.answer && 'border-destructive/60 bg-destructive/10')}>{o}</button>
              ))}
            </div>
            {picked && (
              <div role="status" className={cn('rounded-xl p-3 text-sm', picked === s.answer ? 'bg-success-soft' : 'bg-warn-soft')}>
                <p>{picked === s.answer ? '✅ ' : '❌ '}{s.why}</p>
                {hearts > 0 ? <Button className="mt-2" autoFocus onClick={next}>{i + 1 < order.length ? 'Next slide →' : 'Finish'}</Button> : <Button className="mt-2" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </LabFrame>
  )
}
