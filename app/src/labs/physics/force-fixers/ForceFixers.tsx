import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'

type Option = { text: string; ok: boolean; why: string }
type Problem = { emoji: string; title: string; story: string; options: Option[]; idea: string }

const PROBLEMS: Problem[] = [
  { emoji: '🚜', title: 'Stuck in the paddy field', story: 'A tractor keeps sinking into the soft, wet soil of a paddy field.', idea: 'Pressure = force ÷ area', options: [
    { text: 'Fit wider tyres', ok: true, why: 'Wider tyres spread the weight over a bigger area, so the pressure on the soil is lower and the tractor sinks less.' },
    { text: 'Fit narrower tyres', ok: false, why: 'Narrow tyres increase the pressure, so it would sink even deeper.' },
    { text: 'Load it with more sacks', ok: false, why: 'More weight means more force and more pressure.' },
    { text: 'Drive faster', ok: false, why: 'Speed doesn’t change the pressure on the soil.' } ] },
  { emoji: '🔪', title: 'The blunt knife', story: 'Amma’s kitchen knife squashes tomatoes instead of slicing them.', idea: 'Smaller area → bigger pressure', options: [
    { text: 'Sharpen the edge', ok: true, why: 'A sharp edge has a tiny area, so the same push gives a huge pressure that cuts easily.' },
    { text: 'Make the blade wider', ok: false, why: 'A wider edge spreads the force and lowers the pressure.' },
    { text: 'Use a heavier handle', ok: false, why: 'It doesn’t fix the blunt edge.' },
    { text: 'Cut more slowly', ok: false, why: 'Going slowly doesn’t increase the pressure at the edge.' } ] },
  { emoji: '🛵', title: 'Skidding in the monsoon', story: 'A scooter skids on wet roads. The old tyres are completely smooth.', idea: 'Friction and grip', options: [
    { text: 'Replace them with tyres that have deep treads', ok: true, why: 'Treads push water out of the way and increase friction (grip) with the road.' },
    { text: 'Pump the tyres extra hard', ok: false, why: 'Over-inflated tyres touch less road and grip less.' },
    { text: 'Polish the tyres to make them shiny', ok: false, why: 'Smoother tyres have even less friction.' },
    { text: 'Oil the tyres', ok: false, why: 'Oil reduces friction: very dangerous!' } ] },
  { emoji: '🗄️', title: 'Moving the heavy almirah', story: 'Two people can barely push a heavy steel almirah across the floor.', idea: 'Rolling vs sliding friction', options: [
    { text: 'Put it on a trolley with wheels', ok: true, why: 'Rolling friction is much smaller than sliding friction, so it moves easily.' },
    { text: 'Push it across a rough carpet', ok: false, why: 'A rough carpet increases friction.' },
    { text: 'Put more clothes inside first', ok: false, why: 'More weight means more friction.' },
    { text: 'Push it upward and forward at the same time', ok: false, why: 'Hard to do, and it won’t help much.' } ] },
  { emoji: '🏞️', title: 'Designing a dam', story: 'Engineers are designing a new dam wall on the Krishna river.', idea: 'Liquid pressure increases with depth', options: [
    { text: 'Make the wall thickest at the bottom', ok: true, why: 'Water pressure is greatest at the bottom, so the wall must be strongest there.' },
    { text: 'Make the wall thickest at the top', ok: false, why: 'The top faces the least pressure.' },
    { text: 'Make it the same thickness everywhere', ok: false, why: 'This wastes material at the top or is too weak at the bottom.' },
    { text: 'Leave holes near the bottom to let water out', ok: false, why: 'Water would jet out with great force at the bottom!' } ] },
  { emoji: '🚲', title: 'The squeaky chain', story: 'A cycle chain squeaks and is hard to pedal after the rainy season.', idea: 'Reducing friction', options: [
    { text: 'Clean it and apply oil', ok: true, why: 'Oil (a lubricant) reduces friction between the moving parts.' },
    { text: 'Rub sand on it', ok: false, why: 'Sand increases friction and wears out the chain.' },
    { text: 'Paint it', ok: false, why: 'Paint would crack and doesn’t help the moving parts slide.' },
    { text: 'Pedal harder', ok: false, why: 'This wastes energy; the friction is still there.' } ] },
  { emoji: '🌀', title: 'Cyclone warning', story: 'IMD warns that a very severe cyclone will hit the Odisha coast in 36 hours.', idea: 'Low pressure → powerful winds and storm surge', options: [
    { text: 'Move people to cyclone shelters early and secure loose objects', ok: true, why: 'Deep low pressure means violent winds and a storm surge. Early evacuation saved many thousands of lives during Cyclone Phailin (2013).' },
    { text: 'Go to the beach to watch the waves', ok: false, why: 'Storm surges and flying debris are deadly.' },
    { text: 'Wait until the wind starts before deciding', ok: false, why: 'By then it’s too dangerous to travel.' },
    { text: 'Open all windows to let the wind pass through', ok: false, why: 'Strong winds would rush in and cause damage. Secure the house instead.' } ] },
  { emoji: '🧑‍🚀', title: 'Jumping on the Moon', story: 'An astronaut finds she can jump six times higher on the Moon.', idea: 'Mass stays the same; weight depends on gravity', options: [
    { text: 'Her weight is about 1/6 of her Earth weight, but her mass is the same', ok: true, why: 'Moon gravity is about 1/6 of Earth’s, so the same legs lift her much higher.' },
    { text: 'Her mass became smaller', ok: false, why: 'Mass (amount of matter) never changes by going to the Moon.' },
    { text: 'There is no gravity on the Moon', ok: false, why: 'There is gravity: it’s just weaker. Otherwise she would float away!' },
    { text: 'Her muscles got stronger', ok: false, why: 'Her muscles are the same; gravity is weaker.' } ] },
]

export default function ForceFixers() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const problems = useMemo(() => PROBLEMS.map((p) => ({ ...p, options: shuffle(p.options) })), [round])
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<Option | null>(null)
  const done = i >= problems.length
  const lost = hearts === 0 && !picked
  const p = problems[i]

  const choose = (o: Option) => {
    if (picked) return
    setPicked(o)
    if (o.ok) sfx.correct()
    else {
      sfx.wrong()
      setHearts((h) => h - 1)
    }
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setPicked(null)
    if (n >= problems.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('force-fixer')) addXp(25 + hearts * 10, 'Force Fixer!')
      awardBadge('force-fixer')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="force-fixers" title="Boss Challenge: Force Fixers" subtitle="Eight real problems. Fix each one with forces, friction and pressure." howTo={<p>Choose the best fix for each problem. A wrong choice costs a ❤️. Think about which physics idea is involved.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🛠️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Certified Force Fixer! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : lost ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-5xl">🔧</p>
          <p className="mt-2 font-heading text-xl font-semibold">Out of lives. Review the idea behind each problem and try again!</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
            <span className="text-5xl" aria-hidden>{p.emoji}</span>
            <div><p className="font-heading text-xl font-semibold">{p.title}</p><p className="text-[15px]">{p.story}</p></div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {p.options.map((o) => (
              <button key={o.text} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left text-sm', !picked && 'hover:border-chem', picked && o.ok && 'border-success bg-success-soft', picked === o && !o.ok && 'border-destructive/60 bg-destructive/10', picked && picked !== o && !o.ok && 'opacity-50')}>{o.text}</button>
            ))}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl p-4 text-sm', picked.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked.ok ? '✅ ' : '❌ '}{picked.why}</p>
              <p className="mt-1 font-semibold">🧠 Physics idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
