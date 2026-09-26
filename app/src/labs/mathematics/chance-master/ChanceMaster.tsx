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
  { emoji: '➕', title: 'AP term', story: 'Find the 20th term of 5, 8, 11, 14, …', idea: 'aₙ = a + (n − 1)d', options: [
    { text: '62', ok: true, why: '5 + 19 × 3 = 62.' },
    { text: '65', ok: false, why: 'Use n − 1 = 19, not 20.' },
    { text: '60', ok: false, why: 'Add the first term 5.' },
    { text: '100', ok: false, why: 'That’s 20 × 5.' },
  ] },
  { emoji: '∑', title: 'AP sum', story: 'Find 1 + 2 + 3 + … + 50.', idea: 'Sum = n/2 × (first + last)', options: [
    { text: '1275', ok: true, why: '25 × 51 = 1275.' },
    { text: '2550', ok: false, why: 'Divide by 2.' },
    { text: '1250', ok: false, why: 'Check: 25 × 51.' },
    { text: '5050', ok: false, why: 'That’s up to 100.' },
  ] },
  { emoji: '✖️', title: 'GP term', story: 'Find the next term: 3, 12, 48, …', idea: 'Multiply by the common ratio', options: [
    { text: '192', ok: true, why: 'r = 4; 48 × 4 = 192.' },
    { text: '84', ok: false, why: 'It’s multiplying, not adding 36.' },
    { text: '96', ok: false, why: 'The ratio is 4, not 2.' },
    { text: '144', ok: false, why: '48 × 3 uses the wrong ratio.' },
  ] },
  { emoji: '🗼', title: 'Tower of Hanoi', story: 'What is the fewest number of moves to move 5 discs?', idea: 'M(n) = 2ⁿ − 1', options: [
    { text: '31', ok: true, why: '2⁵ − 1 = 31.' },
    { text: '32', ok: false, why: 'Subtract 1.' },
    { text: '25', ok: false, why: 'It grows as a power of 2.' },
    { text: '10', ok: false, why: 'Far more moves are needed.' },
  ] },
  { emoji: '📊', title: 'Histogram', story: 'Why do the bars of a histogram touch?', idea: 'Continuous classes', options: [
    { text: 'The data is continuous, grouped in classes with no gaps', ok: true, why: 'Each class ends where the next begins.' },
    { text: 'To save space', ok: false, why: 'It’s about the data, not space.' },
    { text: 'Because all bars are equal', ok: false, why: 'Bars can have different heights.' },
    { text: 'Because it shows categories', ok: false, why: 'Bar charts show categories, with gaps.' },
  ] },
  { emoji: '📐', title: 'Class midpoint', story: 'What is the midpoint of the class 20–30?', idea: 'Midpoint = (lower + upper) ÷ 2', options: [
    { text: '25', ok: true, why: '(20 + 30) ÷ 2 = 25.' },
    { text: '10', ok: false, why: 'That’s the class width.' },
    { text: '50', ok: false, why: 'Divide by 2.' },
    { text: '30', ok: false, why: 'That’s the upper boundary.' },
  ] },
  { emoji: '🪙', title: 'Two coins', story: 'Two fair coins are tossed. What is P(exactly one head)?', idea: 'HT and TH out of HH, HT, TH, TT', options: [
    { text: '1/2', ok: true, why: '2 of the 4 equally likely outcomes.' },
    { text: '1/4', ok: false, why: 'There are two ways: HT and TH.' },
    { text: '3/4', ok: false, why: 'That’s at least one head.' },
    { text: '1/3', ok: false, why: 'There are 4 outcomes, not 3.' },
  ] },
  { emoji: '🎲', title: 'Complement', story: 'P(rain tomorrow) = 0.35. What is P(no rain)?', idea: 'P(not A) = 1 − P(A)', options: [
    { text: '0.65', ok: true, why: '1 − 0.35 = 0.65.' },
    { text: '0.35', ok: false, why: 'That’s the probability of rain.' },
    { text: '0.5', ok: false, why: 'Only if both were equally likely.' },
    { text: '1.35', ok: false, why: 'Probabilities can’t exceed 1.' },
  ] },
  { emoji: '🔴', title: 'Without replacement', story: 'A bag has 3 red and 2 blue marbles. Two are taken without replacement. P(both red)?', idea: 'Multiply along the branches: 3/5 × 2/4', options: [
    { text: '3/10', ok: true, why: '3/5 × 2/4 = 6/20 = 3/10.' },
    { text: '9/25', ok: false, why: 'That’s WITH replacement.' },
    { text: '3/5', ok: false, why: 'That’s only the first pick.' },
    { text: '1/2', ok: false, why: 'That’s the second branch only.' },
  ] },
  { emoji: '🧪', title: 'Experimental', story: 'A drawing pin lands point-up 36 times in 60 throws. What is the experimental probability of point-up?', idea: 'Frequency ÷ total trials', options: [
    { text: '0.6', ok: true, why: '36 ÷ 60 = 0.6.' },
    { text: '0.36', ok: false, why: 'Divide by 60, not 100.' },
    { text: '0.4', ok: false, why: 'That’s point-down.' },
    { text: '0.5', ok: false, why: 'Pins aren’t symmetrical; use the data.' },
  ] },
]

export default function ChanceMaster() {
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
      if (!useProgress.getState().badges.includes('chance-master')) addXp(25 + hearts * 10, 'Chance Master!')
      awardBadge('chance-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="chance-master" title="Boss Challenge: Chance Master" subtitle="Ten problems on sequences, grouped data and probability." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🎲</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Chance Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
