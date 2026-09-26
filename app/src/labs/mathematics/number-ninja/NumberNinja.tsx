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
  { emoji: '🌡️', title: 'Shimla in winter', story: 'At night Shimla is at −4 °C. By afternoon it is 9 °C. By how many degrees did it warm up?', idea: 'Difference = higher − lower, even across zero', options: [
    { text: '13 °C', ok: true, why: '9 − (−4) = 9 + 4 = 13. On a thermometer, that is 4 degrees up to zero, then 9 more.' },
    { text: '5 °C', ok: false, why: '9 − 4 = 5 forgets that −4 is below zero; the gap crosses zero.' },
    { text: '−13 °C', ok: false, why: 'It got warmer, so the rise is positive.' },
    { text: '−5 °C', ok: false, why: 'The temperature went up, and by more than 5 degrees.' } ] },
  { emoji: '🧮', title: 'Sign sprint', story: 'Work out (−6) × (−7) − 50.', idea: 'Same signs multiply to a positive', options: [
    { text: '−8', ok: true, why: '(−6) × (−7) = +42, and 42 − 50 = −8.' },
    { text: '−92', ok: false, why: 'That treats (−6) × (−7) as −42. Two negatives give a positive.' },
    { text: '92', ok: false, why: 'Check both the sign of the product and the subtraction.' },
    { text: '8', ok: false, why: '42 − 50 is below zero.' } ] },
  { emoji: '🍕', title: 'Pizza night', story: 'Adam eats 3/8 of a pizza and his sister eats 1/4. What fraction of the pizza did they eat together?', idea: 'Add fractions with a common denominator', options: [
    { text: '5/8', ok: true, why: '1/4 = 2/8, so 3/8 + 2/8 = 5/8.' },
    { text: '4/12', ok: false, why: 'You can’t add the tops and the bottoms; the pieces must be the same size first.' },
    { text: '3/32', ok: false, why: 'That’s 3/8 × 1/4, a product, not a sum.' },
    { text: '7/8', ok: false, why: '1/4 is 2/8, not 4/8.' } ] },
  { emoji: '🥛', title: 'Payasam batches', story: 'Each batch of payasam needs 3/4 cup of milk. You have 3 cups. How many batches can you make?', idea: 'Division: how many 3/4s fit in 3?', options: [
    { text: '4', ok: true, why: '3 ÷ 3/4 = 3 × 4/3 = 4. Check: 4 × 3/4 = 3 cups.' },
    { text: '2 1/4', ok: false, why: 'That is 3 × 3/4. You need to divide, not multiply.' },
    { text: '3 3/4', ok: false, why: 'That adds instead of dividing.' },
    { text: '12', ok: false, why: '3 × 4 forgets to divide by 3.' } ] },
  { emoji: '🔁', title: 'Never-ending digits', story: 'Which of these fractions has a recurring (repeating) decimal?', idea: 'Denominators with only 2s and 5s terminate', options: [
    { text: '1/12', ok: true, why: '12 = 2 × 2 × 3. The 3 means it recurs: 1/12 = 0.08333…' },
    { text: '3/8', ok: false, why: '8 = 2 × 2 × 2, so 3/8 = 0.375 stops.' },
    { text: '7/20', ok: false, why: '20 = 2 × 2 × 5, so 7/20 = 0.35 stops.' },
    { text: '9/25', ok: false, why: '25 = 5 × 5, so 9/25 = 0.36 stops.' } ] },
  { emoji: '🏦', title: 'Bank balance', story: 'An account is overdrawn at ₹ −250. ₹400 is deposited, then ₹175 withdrawn. What is the balance now?', idea: 'Integers track money in and out', options: [
    { text: '₹ −25', ok: true, why: '−250 + 400 = 150, and 150 − 175 = −25. Still slightly overdrawn.' },
    { text: '₹ 25', ok: false, why: '150 − 175 goes below zero.' },
    { text: '₹ −825', ok: false, why: 'The ₹400 deposit adds money.' },
    { text: '₹ 325', ok: false, why: 'The withdrawal must be subtracted.' } ] },
  { emoji: '➗', title: 'Negative fractions', story: 'Work out (−3/4) ÷ (3/8).', idea: 'Keep, change, flip, and apply the sign rule', options: [
    { text: '−2', ok: true, why: '−3/4 × 8/3 = −24/12 = −2. Negative ÷ positive is negative.' },
    { text: '−9/32', ok: false, why: 'That multiplies without flipping the second fraction.' },
    { text: '2', ok: false, why: 'The signs are different, so the answer is negative.' },
    { text: '−1/2', ok: false, why: 'Flip the second fraction (the divisor), not the first.' } ] },
  { emoji: '📏', title: 'In between', story: 'Which number lies between 2/5 and 1/2?', idea: 'Density: there is always another rational in between', options: [
    { text: '9/20', ok: true, why: '2/5 = 8/20 and 1/2 = 10/20, so 9/20 is right between them (0.45).' },
    { text: '3/5', ok: false, why: '3/5 = 0.6 is bigger than 1/2.' },
    { text: '1/3', ok: false, why: '1/3 ≈ 0.33 is smaller than 2/5 = 0.4.' },
    { text: '11/20', ok: false, why: '11/20 = 0.55 is bigger than 1/2.' } ] },
  { emoji: '🧊', title: 'Coldest to warmest', story: 'Which of these is the greatest? −0.5, −2/3, −1/4, −0.3', idea: 'For negatives, closer to zero means greater', options: [
    { text: '−1/4', ok: true, why: '−1/4 = −0.25 is closest to zero, so it is the greatest.' },
    { text: '−2/3', ok: false, why: '−2/3 ≈ −0.67 is the furthest below zero: the smallest.' },
    { text: '−0.5', ok: false, why: '−0.5 is less than −0.3 and −0.25.' },
    { text: '−0.3', ok: false, why: 'Close! But −0.25 is even nearer to zero.' } ] },
  { emoji: '🧩', title: 'Pattern power', story: 'Work out −1 + 2 − 3 + 4 − 5 + 6 − … − 99 + 100.', idea: 'Spot a pattern: group the terms in pairs', options: [
    { text: '50', ok: true, why: 'Pair them: (−1 + 2) + (−3 + 4) + … + (−99 + 100). That’s 50 pairs, each worth 1.' },
    { text: '0', ok: false, why: 'The positives are always 1 bigger in each pair.' },
    { text: '−50', ok: false, why: 'Each pair (−1 + 2) is +1, not −1.' },
    { text: '100', ok: false, why: 'There are 100 numbers but only 50 pairs.' } ] },
]

export default function NumberNinja() {
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
      if (!useProgress.getState().badges.includes('number-ninja')) addXp(25 + hearts * 10, 'Number Ninja!')
      awardBadge('number-ninja')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="number-ninja" title="Boss Challenge: Number Ninja" subtitle="Ten problems with integers, fractions, decimals and rational numbers." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🥷</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Number Ninja! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
