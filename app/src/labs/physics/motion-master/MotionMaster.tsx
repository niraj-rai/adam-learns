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
  { emoji: '🧭', title: 'Treasure walk', story: 'You walk 3 km east, then 4 km north. What is your displacement?', idea: 'Displacement is the straight line from start to finish', options: [
    { text: '5 km, roughly north-east', ok: true, why: '√(3² + 4²) = 5 km, in the direction from start to finish.' },
    { text: '7 km', ok: false, why: 'That’s the distance walked, not the displacement.' },
    { text: '1 km', ok: false, why: 'Subtracting doesn’t work for directions at right angles.' },
    { text: '5 km, but it has no direction', ok: false, why: 'Displacement is a vector: it always has a direction.' } ] },
  { emoji: '🏃', title: 'One lap', story: 'An athlete runs one full lap of a 400 m track and finishes where she started. What are her distance and displacement?', idea: 'Back to the start means zero displacement', options: [
    { text: 'Distance 400 m, displacement 0 m', ok: true, why: 'She covered 400 m of path but ended where she began.' },
    { text: 'Both 400 m', ok: false, why: 'Displacement compares only start and finish.' },
    { text: 'Both 0 m', ok: false, why: 'She definitely ran 400 m of distance.' },
    { text: 'Distance 0 m, displacement 400 m', ok: false, why: 'That’s the wrong way round.' } ] },
  { emoji: '🚗', title: 'Zero to twenty', story: 'A car goes from rest to 20 m/s in 8 s. What is its acceleration?', idea: 'a = (v − u) ÷ t', options: [
    { text: '2.5 m/s²', ok: true, why: '(20 − 0) ÷ 8 = 2.5.' },
    { text: '160 m/s²', ok: false, why: 'Divide the change in velocity by the time; don’t multiply.' },
    { text: '0.4 m/s²', ok: false, why: 'That’s 8 ÷ 20, upside down.' },
    { text: '20 m/s²', ok: false, why: 'That’s the final velocity, not the acceleration.' } ] },
  { emoji: '📐', title: 'Area under the graph', story: 'A v–t graph is a horizontal line at 10 m/s from 0 to 6 s. How far did the object travel?', idea: 'Area under a v–t graph = displacement', options: [
    { text: '60 m', ok: true, why: 'Rectangle: 10 × 6 = 60 m.' },
    { text: '16 m', ok: false, why: 'Multiply, don’t add.' },
    { text: '0 m', ok: false, why: 'A flat line means constant velocity, not zero velocity.' },
    { text: '1.67 m', ok: false, why: 'That’s 10 ÷ 6.' } ] },
  { emoji: '🚇', title: 'Metro stop', story: 'A metro train at 20 m/s brakes with a deceleration of 1.25 m/s². How long does it take to stop?', idea: 'v = u + at with v = 0', options: [
    { text: '16 s', ok: true, why: '0 = 20 − 1.25t, so t = 16 s.' },
    { text: '25 s', ok: false, why: 'Check: 1.25 × 25 = 31.25, more than 20.' },
    { text: '160 s', ok: false, why: '160 is the stopping distance in metres.' },
    { text: '0.0625 s', ok: false, why: 'That’s 1.25 ÷ 20, upside down.' } ] },
  { emoji: '🥥', title: 'Falling coconut', story: 'A coconut falls from rest for 2 s (g = 9.8 m/s², no air resistance). How fast is it moving?', idea: 'v = u + gt', options: [
    { text: '19.6 m/s', ok: true, why: '0 + 9.8 × 2 = 19.6 m/s.' },
    { text: '9.8 m/s', ok: false, why: 'That’s after only 1 second.' },
    { text: '19.6 m', ok: false, why: 'Velocity is measured in m/s, not m.' },
    { text: '4.9 m/s', ok: false, why: 'That uses ½gt instead of gt.' } ] },
  { emoji: '📈', title: 'Straight s–t line', story: 'A displacement–time graph is a straight line sloping upwards. What does that tell you?', idea: 'Slope of s–t = velocity', options: [
    { text: 'Constant velocity', ok: true, why: 'Equal displacements in equal times.' },
    { text: 'Constant acceleration', ok: false, why: 'Acceleration would make the s–t line curve.' },
    { text: 'The object is at rest', ok: false, why: 'At rest would be a flat line.' },
    { text: 'The object is going uphill', ok: false, why: 'A graph isn’t a picture of the road.' } ] },
  { emoji: '➖', title: 'Flat v–t line', story: 'A velocity–time graph is a horizontal line at 15 m/s. What is the acceleration?', idea: 'Slope of v–t = acceleration', options: [
    { text: '0 m/s²', ok: true, why: 'The velocity isn’t changing, so there’s no acceleration.' },
    { text: '15 m/s²', ok: false, why: '15 m/s is the velocity, which stays constant.' },
    { text: 'It is decelerating', ok: false, why: 'The velocity would be falling.' },
    { text: 'It can’t be worked out', ok: false, why: 'The slope is zero.' } ] },
  { emoji: '🎡', title: 'Giant wheel', story: 'A giant wheel turns at a steady speed. Is a rider accelerating?', idea: 'Velocity includes direction', options: [
    { text: 'Yes, because the direction of motion keeps changing', ok: true, why: 'Changing direction means changing velocity, which is acceleration.' },
    { text: 'No, because the speed is constant', ok: false, why: 'Constant speed isn’t constant velocity when the direction changes.' },
    { text: 'Only at the top', ok: false, why: 'The direction changes all the way round.' },
    { text: 'Only when the wheel starts', ok: false, why: 'It also accelerates while turning steadily.' } ] },
  { emoji: '🪨', title: 'Let it go', story: 'A stone whirled on a string is released at the top of the circle. Which way does it fly?', idea: 'With no force, it keeps its velocity', options: [
    { text: 'Along the tangent, in the direction it was moving', ok: true, why: 'Newton’s first law: it carries on in a straight line.' },
    { text: 'Straight outwards, away from the centre', ok: false, why: 'There’s no outward push; it just stops being pulled in.' },
    { text: 'Towards the centre', ok: false, why: 'The inward pull disappears when you let go.' },
    { text: 'It keeps going round in a circle', ok: false, why: 'Circles need a constant inward pull.' } ] },
]

export default function MotionMaster() {
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
      if (!useProgress.getState().badges.includes('motion-master')) addXp(25 + hearts * 10, 'Motion Master!')
      awardBadge('motion-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="motion-master" title="Boss Challenge: Motion Master" subtitle="Ten problems on displacement, velocity, acceleration and graphs." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏎️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Motion Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
