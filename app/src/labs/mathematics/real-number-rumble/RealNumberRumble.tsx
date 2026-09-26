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
  { emoji: '🔁', title: 'Repeating or not?', story: 'Which fraction has a terminating decimal?', idea: 'Terminates iff the denominator (lowest terms) has only 2s and 5s', options: [
    { text: '7/40', ok: true, why: '40 = 2³ × 5, so 7/40 = 0.175.' },
    { text: '1/6', ok: false, why: '6 has a factor 3: 0.1666…' },
    { text: '2/7', ok: false, why: '7 gives a repeating block 285714.' },
    { text: '5/12', ok: false, why: '12 has a factor 3.' },
  ] },
  { emoji: '🧮', title: 'Recurring to fraction', story: 'Write 0.(27) = 0.272727… as a fraction in lowest terms.', idea: 'x = 0.2727…; 100x − x = 27', options: [
    { text: '3/11', ok: true, why: '99x = 27, so x = 27/99 = 3/11.' },
    { text: '27/100', ok: false, why: 'That would be 0.27 exactly, which stops.' },
    { text: '27/90', ok: false, why: 'Use 99, since two digits repeat.' },
    { text: '2/7', ok: false, why: '2/7 = 0.285714…' },
  ] },
  { emoji: '🌀', title: 'Irrational?', story: 'Which number is irrational?', idea: 'Irrational: not p/q; the decimal never ends or repeats', options: [
    { text: '√5', ok: true, why: '5 is not a perfect square, so √5 is irrational.' },
    { text: '√16', ok: false, why: '√16 = 4, a whole number.' },
    { text: '0.(3)', ok: false, why: 'A recurring decimal is rational (1/3).' },
    { text: '22/7', ok: false, why: '22/7 is a fraction, so it is rational (it only approximates π).' },
  ] },
  { emoji: '✂️', title: 'Simplify', story: 'Simplify √48.', idea: 'Take out the biggest square factor', options: [
    { text: '4√3', ok: true, why: '√48 = √(16 × 3) = 4√3.' },
    { text: '2√12', ok: false, why: 'Not simplest: √12 still has a square factor.' },
    { text: '16√3', ok: false, why: 'Take the square ROOT of 16.' },
    { text: '3√4', ok: false, why: 'Find a square factor, not 4 × 12 the wrong way round.' },
  ] },
  { emoji: '➕', title: 'Like surds', story: 'Work out 3√2 + 5√2 − √2.', idea: 'Add like surds like like terms', options: [
    { text: '7√2', ok: true, why: '(3 + 5 − 1)√2 = 7√2.' },
    { text: '7√6', ok: false, why: 'The number under the root doesn’t change.' },
    { text: '8√2', ok: false, why: 'Don’t forget to subtract √2.' },
    { text: '√14', ok: false, why: 'You can’t add under the root sign.' },
  ] },
  { emoji: '✖️', title: 'Multiply', story: 'Work out √6 × √15.', idea: '√a × √b = √(ab)', options: [
    { text: '3√10', ok: true, why: '√90 = √(9 × 10) = 3√10.' },
    { text: '√21', ok: false, why: 'Multiply the numbers, don’t add them.' },
    { text: '90', ok: false, why: 'That’s the number under the root: √90.' },
    { text: '9√10', ok: false, why: '√9 = 3, not 9.' },
  ] },
  { emoji: '➗', title: 'Rationalise', story: 'Rationalise 1/√3.', idea: 'Multiply top and bottom by √3', options: [
    { text: '√3/3', ok: true, why: '(1 × √3)/(√3 × √3) = √3/3.' },
    { text: '3/√3', ok: false, why: 'The root is still in the denominator.' },
    { text: '1/3', ok: false, why: 'The numerator becomes √3.' },
    { text: '√3', ok: false, why: 'Don’t forget the denominator 3.' },
  ] },
  { emoji: '🪞', title: 'Conjugate', story: 'Rationalise 1/(√5 − √2).', idea: 'Multiply by the conjugate √5 + √2', options: [
    { text: '(√5 + √2)/3', ok: true, why: 'Denominator: 5 − 2 = 3.' },
    { text: '(√5 − √2)/3', ok: false, why: 'Multiply by the conjugate, which has the opposite sign.' },
    { text: '(√5 + √2)/7', ok: false, why: '(√5)² − (√2)² = 5 − 2.' },
    { text: '√3', ok: false, why: 'Surds can’t be subtracted under one root.' },
  ] },
  { emoji: '📏', title: 'Between', story: 'Which of these is an irrational number between 2 and 3?', idea: '√n is between 2 and 3 when n is between 4 and 9', options: [
    { text: '√7', ok: true, why: '√4 = 2 and √9 = 3, and 7 is not a perfect square.' },
    { text: '√9', ok: false, why: '√9 = 3 exactly, and it’s rational.' },
    { text: '2.5', ok: false, why: '2.5 = 5/2 is rational.' },
    { text: '√10', ok: false, why: '√10 ≈ 3.16, bigger than 3.' },
  ] },
  { emoji: '🥧', title: 'About π', story: 'Which statement about π is true?', idea: 'π is irrational', options: [
    { text: 'Its decimal never ends and never repeats', ok: true, why: 'π is irrational: 22/7 and 3.14 are only approximations.' },
    { text: 'π = 22/7 exactly', ok: false, why: '22/7 = 3.142857…, but π = 3.14159…' },
    { text: 'π = 3.14 exactly', ok: false, why: '3.14 is only an approximation.' },
    { text: 'π is a recurring decimal', ok: false, why: 'Recurring decimals are rational; π isn’t.' },
  ] },
]

export default function RealNumberRumble() {
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
      if (!useProgress.getState().badges.includes('real-number-rumble')) addXp(25 + hearts * 10, 'Real Number Rumble!')
      awardBadge('real-number-rumble')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="real-number-rumble" title="Boss Challenge: Real Number Rumble" subtitle="Ten problems on decimals, irrational numbers and surds." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">♾️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Real Number Rumble! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
