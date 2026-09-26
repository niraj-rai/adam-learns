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
  { emoji: '⚖️', title: 'Tug of war', story: 'Team A pulls left with 450 N; Team B pulls right with 450 N. The rope doesn’t move. Why?', idea: 'Balanced forces mean no change in motion', options: [
    { text: 'The forces are balanced: resultant 0 N', ok: true, why: '450 − 450 = 0, so there is no acceleration.' },
    { text: 'There are no forces on the rope', ok: false, why: 'There are two large forces; they just cancel.' },
    { text: 'Friction is stopping it', ok: false, why: 'Even on ice it wouldn’t move: the pulls cancel.' },
    { text: 'The resultant is 900 N', ok: false, why: 'Opposite forces subtract, not add.' } ] },
  { emoji: '🚌', title: 'Sudden brake', story: 'A bus brakes suddenly and the standing passengers lurch forwards. Why?', idea: 'Inertia: objects keep moving unless a force acts', options: [
    { text: 'Their bodies tend to keep moving forwards (inertia)', ok: true, why: 'The bus slows, but nothing has yet slowed the passengers.' },
    { text: 'The bus pushes them forwards', ok: false, why: 'No forward force acts; they just carry on moving.' },
    { text: 'Gravity pulls them forwards', ok: false, why: 'Gravity pulls down, not forwards.' },
    { text: 'The brakes create a forward force on people', ok: false, why: 'The brakes act on the wheels, not on the passengers.' } ] },
  { emoji: '🛒', title: 'Push the trolley', story: 'A resultant force of 30 N acts on a 15 kg shopping trolley. What is its acceleration?', idea: 'a = F ÷ m', options: [
    { text: '2 m/s²', ok: true, why: '30 ÷ 15 = 2 m/s².' },
    { text: '450 m/s²', ok: false, why: 'Divide the force by the mass; don’t multiply.' },
    { text: '0.5 m/s²', ok: false, why: 'That’s 15 ÷ 30, upside down.' },
    { text: '45 m/s²', ok: false, why: 'Adding force and mass doesn’t give acceleration.' } ] },
  { emoji: '🏍️', title: 'Force needed', story: 'What force is needed to give a 200 kg motorbike (with rider) an acceleration of 3 m/s²?', idea: 'F = ma', options: [
    { text: '600 N', ok: true, why: '200 × 3 = 600 N.' },
    { text: '66.7 N', ok: false, why: 'That divides instead of multiplying.' },
    { text: '203 N', ok: false, why: 'Multiply mass and acceleration.' },
    { text: '0.015 N', ok: false, why: 'That’s 3 ÷ 200.' } ] },
  { emoji: '🚀', title: 'Rocket launch', story: 'A rocket in space pushes hot gas out backwards. What pushes the rocket forwards?', idea: 'Action and reaction are equal and opposite', options: [
    { text: 'The gas pushes back on the rocket', ok: true, why: 'Newton’s third law: rocket pushes gas back, gas pushes rocket forward.' },
    { text: 'The gas pushes against the air behind it', ok: false, why: 'Rockets work in space, where there is no air.' },
    { text: 'Gravity pulls it forwards', ok: false, why: 'Gravity doesn’t push a rocket forwards.' },
    { text: 'Nothing: rockets can’t move in space', ok: false, why: 'They can, thanks to the reaction force.' } ] },
  { emoji: '🍎', title: 'Force pairs', story: 'The Earth pulls an apple down with 1 N. According to Newton’s third law, what is the paired force?', idea: 'Third-law pairs act on different objects', options: [
    { text: 'The apple pulls the Earth up with 1 N', ok: true, why: 'Same type of force, equal size, opposite direction, on the other object.' },
    { text: 'The table pushes the apple up with 1 N', ok: false, why: 'That acts on the same object (the apple), so it isn’t the pair.' },
    { text: 'There is no paired force', ok: false, why: 'Every force has a partner.' },
    { text: 'The apple pulls the Earth up with a tiny force', ok: false, why: 'The forces are equal; only the Earth’s acceleration is tiny.' } ] },
  { emoji: '🏏', title: 'Momentum', story: 'A 0.16 kg cricket ball moves at 25 m/s. What is its momentum?', idea: 'p = m × v', options: [
    { text: '4 kg m/s', ok: true, why: '0.16 × 25 = 4 kg m/s.' },
    { text: '156 kg m/s', ok: false, why: 'That’s 25 ÷ 0.16.' },
    { text: '25.16 kg m/s', ok: false, why: 'Multiply, don’t add.' },
    { text: '50 J', ok: false, why: 'Momentum is in kg m/s, not joules.' } ] },
  { emoji: '🚂', title: 'Coupling wagons', story: 'A 2000 kg wagon at 3 m/s hits a stationary 1000 kg wagon and they couple together. How fast do they move?', idea: 'Total momentum before = total momentum after', options: [
    { text: '2 m/s', ok: true, why: '2000 × 3 = 6000 kg m/s, shared by 3000 kg: 6000 ÷ 3000 = 2 m/s.' },
    { text: '3 m/s', ok: false, why: 'The same momentum is now shared by more mass.' },
    { text: '1.5 m/s', ok: false, why: 'Divide by the total mass (3000 kg), not 4000 kg.' },
    { text: '6 m/s', ok: false, why: 'The coupled wagons can’t be faster than the moving one was.' } ] },
  { emoji: '🎈', title: 'Airbags', story: 'Why does an airbag reduce injuries in a crash?', idea: 'A longer stopping time means a smaller force', options: [
    { text: 'It makes the stopping time longer, so the force is smaller', ok: true, why: 'Same change of momentum, spread over more time: F = change in momentum ÷ time.' },
    { text: 'It reduces your momentum before the crash', ok: false, why: 'Your momentum is the same; it’s how quickly it changes that matters.' },
    { text: 'It stops you faster', ok: false, why: 'Stopping faster would mean a bigger force.' },
    { text: 'It removes the force completely', ok: false, why: 'A force is still needed to stop you.' } ] },
  { emoji: '🌙', title: 'Moon walk', story: 'An astronaut has a mass of 90 kg. On the Moon (g = 1.6 N/kg), what are the astronaut’s mass and weight?', idea: 'Mass stays the same; weight W = mg changes', options: [
    { text: 'Mass 90 kg, weight 144 N', ok: true, why: 'Mass doesn’t change; W = 90 × 1.6 = 144 N.' },
    { text: 'Mass 15 kg, weight 144 N', ok: false, why: 'Mass is the amount of matter; it doesn’t change on the Moon.' },
    { text: 'Mass 90 kg, weight 882 N', ok: false, why: 'That’s the weight on Earth (g = 9.8).' },
    { text: 'Mass 144 kg, weight 90 N', ok: false, why: 'Mass and weight are mixed up.' } ] },
]

export default function ForceMaster() {
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
      if (!useProgress.getState().badges.includes('force-master')) addXp(25 + hearts * 10, 'Force Master!')
      awardBadge('force-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="force-master" title="Boss Challenge: Force Master" subtitle="Ten problems on forces, Newton’s laws, momentum and weight." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏋️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Force Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : lost ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-5xl">🧮</p>
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
              <button key={o.text} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left font-mono text-base', !picked && 'hover:border-chem', picked && o.ok && 'border-success bg-success-soft', picked === o && !o.ok && 'border-destructive/60 bg-destructive/10', picked && picked !== o && !o.ok && 'opacity-50')}>{o.text}</button>
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
