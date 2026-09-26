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
  { emoji: '📊', title: 'Class mark', story: 'What is the class mark of the class 20–30?', idea: 'Midpoint of the class', options: [
    { text: '25', ok: true, why: '(20 + 30)/2.' },
    { text: '10', ok: false, why: 'That is the width.' },
    { text: '50', ok: false, why: 'Divide by 2.' },
    { text: '30', ok: false, why: 'That is the upper limit.' },
  ] },
  { emoji: '📈', title: 'Mean', story: 'Classes 0–10, 10–20, 20–30 have frequencies 2, 3, 5. What is the mean?', idea: 'Σfx ÷ Σf with class marks', options: [
    { text: '18', ok: true, why: '(10 + 45 + 125)/10.' },
    { text: '15', ok: false, why: 'That is the middle class mark.' },
    { text: '20', ok: false, why: 'Weight by frequency.' },
    { text: '10/3', ok: false, why: 'That is Σf ÷ 3.' },
  ] },
  { emoji: '⭐', title: 'Modal class', story: 'Frequencies for 0–10, 10–20, 20–30, 30–40 are 4, 9, 6, 3. Which is the modal class?', idea: 'Highest frequency', options: [
    { text: '10–20', ok: true, why: 'Frequency 9 is the highest.' },
    { text: '20–30', ok: false, why: 'Its frequency is 6.' },
    { text: '0–10', ok: false, why: 'Its frequency is 4.' },
    { text: '30–40', ok: false, why: 'That is the lowest.' },
  ] },
  { emoji: '🎯', title: 'Median class', story: 'For n = 40 with cumulative frequencies 5, 13, 25, 35, 40 for classes 0–10 … 40–50, which is the median class?', idea: 'Where cf first reaches n/2 = 20', options: [
    { text: '20–30', ok: true, why: 'cf reaches 25 there.' },
    { text: '10–20', ok: false, why: 'cf is only 13.' },
    { text: '30–40', ok: false, why: 'cf already passed 20.' },
    { text: '0–10', ok: false, why: 'cf is 5.' },
  ] },
  { emoji: '🧮', title: 'Median formula', story: 'Median class 20–30, f = 12, cf before = 13, n = 40. Median?', idea: 'l + ((n/2 − cf)/f) × h', options: [
    { text: '25.83 (about)', ok: true, why: '20 + (7/12) × 10.' },
    { text: '20', ok: false, why: 'Add the fraction of the class.' },
    { text: '27', ok: false, why: 'Use 7/12, not 7/10.' },
    { text: '32', ok: false, why: 'Check: 20 + 5.83.' },
  ] },
  { emoji: '🪙', title: 'Coins', story: 'Two coins are tossed. What is P(at least one head)?', idea: 'Outcomes: HH, HT, TH, TT', options: [
    { text: '3/4', ok: true, why: '3 of 4 outcomes.' },
    { text: '1/2', ok: false, why: 'That is exactly one head.' },
    { text: '1/4', ok: false, why: 'That is two heads.' },
    { text: '2/3', ok: false, why: 'There are 4 outcomes, not 3.' },
  ] },
  { emoji: '🎲', title: 'Dice sum', story: 'Two dice are thrown. What is P(sum = 8)?', idea: 'Count the pairs', options: [
    { text: '5/36', ok: true, why: '(2,6), (3,5), (4,4), (5,3), (6,2).' },
    { text: '1/6', ok: false, why: 'That is P(sum = 7).' },
    { text: '8/36', ok: false, why: 'Count the pairs.' },
    { text: '1/11', ok: false, why: 'The 11 sums aren’t equally likely.' },
  ] },
  { emoji: '🃏', title: 'Cards', story: 'A card is drawn from a pack of 52. What is P(a red face card)?', idea: '6 red face cards', options: [
    { text: '3/26', ok: true, why: '6/52.' },
    { text: '3/13', ok: false, why: 'That is all face cards.' },
    { text: '1/2', ok: false, why: 'That is any red card.' },
    { text: '1/26', ok: false, why: 'There are 6, not 2.' },
  ] },
  { emoji: '🔁', title: 'Complement', story: 'P(E) = 0.35. What is P(not E)?', idea: 'P(E) + P(not E) = 1', options: [
    { text: '0.65', ok: true, why: '1 − 0.35.' },
    { text: '0.35', ok: false, why: 'That is P(E).' },
    { text: '−0.35', ok: false, why: 'Probabilities can’t be negative.' },
    { text: '1.35', ok: false, why: 'Probabilities can’t exceed 1.' },
  ] },
  { emoji: '🎟️', title: 'Lottery', story: 'A box has tickets 1 to 30. What is P(a multiple of 4)?', idea: 'Count 4, 8, …, 28', options: [
    { text: '7/30', ok: true, why: 'There are 7 multiples of 4.' },
    { text: '1/4', ok: false, why: '30 isn’t a multiple of 4.' },
    { text: '8/30', ok: false, why: '32 is beyond 30.' },
    { text: '4/30', ok: false, why: 'Count all the multiples.' },
  ] },
]

export default function StatsMaster() {
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
      if (!useProgress.getState().badges.includes('stats-master')) addXp(25 + hearts * 10, 'Statistics and Probability Master!')
      awardBadge('stats-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="stats-master" title="Boss Challenge: Statistics and Probability Master" subtitle="Ten problems on grouped mean, median, mode and probability." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🎲</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Statistics and Probability Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
