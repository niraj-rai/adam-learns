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
  { emoji: '📏', title: 'Find sin', story: 'In a right triangle, the side opposite θ is 5 and the hypotenuse is 13. What is cos θ?', idea: 'Find the third side first', options: [
    { text: '12/13', ok: true, why: 'Adjacent = √(169 − 25) = 12.' },
    { text: '5/13', ok: false, why: 'That is sin θ.' },
    { text: '5/12', ok: false, why: 'That is tan θ.' },
    { text: '13/12', ok: false, why: 'That is sec θ.' },
  ] },
  { emoji: '🧮', title: 'Standard value', story: 'Evaluate sin 30° + cos 60°.', idea: 'Recall the table', options: [
    { text: '1', ok: true, why: '½ + ½.' },
    { text: '√3', ok: false, why: 'That mixes up the values.' },
    { text: '½', ok: false, why: 'Add both halves.' },
    { text: '0', ok: false, why: 'Both are positive.' },
  ] },
  { emoji: '🔄', title: 'Complement', story: 'What is sin 50° ÷ cos 40°?', idea: 'sin(90° − θ) = cos θ', options: [
    { text: '1', ok: true, why: 'sin 50° = cos 40°.' },
    { text: '0', ok: false, why: 'They are equal, not opposite.' },
    { text: 'tan 10°', ok: false, why: 'Angles don’t subtract like that.' },
    { text: '5/4', ok: false, why: 'You can’t divide the angles.' },
  ] },
  { emoji: '\U0001f7f0', title: 'Identity', story: 'Simplify (1 − cos²θ) ÷ sin θ.', idea: 'sin²θ + cos²θ = 1', options: [
    { text: 'sin θ', ok: true, why: '1 − cos²θ = sin²θ.' },
    { text: 'cos θ', ok: false, why: 'Use the identity.' },
    { text: '1', ok: false, why: 'One sin θ remains.' },
    { text: 'tan θ', ok: false, why: 'No cos θ is left.' },
  ] },
  { emoji: '📈', title: 'Largest', story: 'For 0° < θ < 90°, which is always true?', idea: 'Look at the ranges', options: [
    { text: 'sin θ < 1', ok: true, why: 'sin θ = 1 only at 90°.' },
    { text: 'tan θ < 1', ok: false, why: 'tan 60° = √3.' },
    { text: 'cos θ > 1', ok: false, why: 'cos never exceeds 1.' },
    { text: 'sin θ = cos θ', ok: false, why: 'Only at 45°.' },
  ] },
  { emoji: '🗼', title: 'Tower', story: 'From 30 m away, the angle of elevation of a tower’s top is 60°. How tall is it?', idea: 'h = d tan θ', options: [
    { text: '30√3 m', ok: true, why: '30 × √3 ≈ 52 m.' },
    { text: '10√3 m', ok: false, why: 'That uses tan 30°.' },
    { text: '15 m', ok: false, why: 'That uses sin 30° × 30.' },
    { text: '60 m', ok: false, why: 'That uses the angle as a length.' },
  ] },
  { emoji: '🪜', title: 'Ladder', story: 'A 10 m ladder makes 60° with the ground. How high up the wall does it reach?', idea: 'sin 60° = height/10', options: [
    { text: '5√3 m', ok: true, why: '10 × √3/2 ≈ 8.66 m.' },
    { text: '5 m', ok: false, why: 'That uses cos 60°.' },
    { text: '10√3 m', ok: false, why: 'Multiply by √3/2, not √3.' },
    { text: '20 m', ok: false, why: 'The height can’t exceed the ladder.' },
  ] },
  { emoji: '⛵', title: 'Depression', story: 'From a 50 m cliff, the angle of depression of a boat is 45°. How far is the boat from the foot of the cliff?', idea: 'tan 45° = 1', options: [
    { text: '50 m', ok: true, why: 'Distance = 50 ÷ tan 45°.' },
    { text: '50√2 m', ok: false, why: 'That is the line of sight.' },
    { text: '25 m', ok: false, why: 'tan 45° = 1, not 2.' },
    { text: '50√3 m', ok: false, why: 'That is for 30°.' },
  ] },
  { emoji: '🪁', title: 'Kite', story: 'A kite is 60 m high on a string making 30° with the ground. How long is the string?', idea: 'sin 30° = 60/L', options: [
    { text: '120 m', ok: true, why: 'L = 60 ÷ ½.' },
    { text: '30 m', ok: false, why: 'Divide by ½, don’t multiply.' },
    { text: '60√3 m', ok: false, why: 'That uses tan.' },
    { text: '40√3 m', ok: false, why: 'That uses cos.' },
  ] },
  { emoji: '🌞', title: 'Sun’s altitude', story: 'A pole’s shadow equals its height. What is the Sun’s altitude?', idea: 'tan θ = height/shadow = 1', options: [
    { text: '45°', ok: true, why: 'tan 45° = 1.' },
    { text: '30°', ok: false, why: 'tan 30° = 1/√3.' },
    { text: '60°', ok: false, why: 'tan 60° = √3.' },
    { text: '90°', ok: false, why: 'Then there would be no shadow.' },
  ] },
]

export default function TrigMaster() {
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
      if (!useProgress.getState().badges.includes('trig-master')) addXp(25 + hearts * 10, 'Trigonometry Master!')
      awardBadge('trig-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="trig-master" title="Boss Challenge: Trigonometry Master" subtitle="Ten problems on trigonometric ratios, identities, and heights and distances." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">📐</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Trigonometry Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Maths idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
