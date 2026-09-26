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
  { emoji: '🔓', title: 'Factorise', story: 'Solve x² − 7x + 12 = 0.', idea: 'Find two numbers with product 12 and sum −7', options: [
    { text: 'x = 3 or x = 4', ok: true, why: '(x − 3)(x − 4) = 0.' },
    { text: 'x = −3 or x = −4', ok: false, why: 'Signs are wrong.' },
    { text: 'x = 2 or x = 6', ok: false, why: 'Sum would be 8.' },
    { text: 'x = 1 or x = 12', ok: false, why: 'Sum would be 13.' },
  ] },
  { emoji: '📐', title: 'Formula', story: 'Solve 2x² + x − 6 = 0.', idea: 'x = (−b ± √D)/2a', options: [
    { text: 'x = 3/2 or x = −2', ok: true, why: 'D = 1 + 48 = 49: (−1 ± 7)/4.' },
    { text: 'x = −3/2 or x = 2', ok: false, why: 'Signs swapped.' },
    { text: 'x = 3 or x = −4', ok: false, why: 'Divide by 2a = 4, not 2.' },
    { text: 'No real roots', ok: false, why: 'D = 49 > 0.' },
  ] },
  { emoji: '🔍', title: 'Discriminant', story: 'What is the nature of the roots of 3x² − 2x + 1 = 0?', idea: 'D = b² − 4ac', options: [
    { text: 'No real roots', ok: true, why: 'D = 4 − 12 = −8 < 0.' },
    { text: 'Two distinct real roots', ok: false, why: 'D is negative.' },
    { text: 'Two equal real roots', ok: false, why: 'D is not 0.' },
    { text: 'One positive root only', ok: false, why: 'There are no real roots.' },
  ] },
  { emoji: '🎯', title: 'Equal roots', story: 'For what positive k does x² − kx + 9 = 0 have equal roots?', idea: 'Set D = 0', options: [
    { text: 'k = 6', ok: true, why: 'k² − 36 = 0.' },
    { text: 'k = 3', ok: false, why: 'Then D = 9 − 36 < 0.' },
    { text: 'k = 9', ok: false, why: 'Then D = 81 − 36 > 0.' },
    { text: 'k = 36', ok: false, why: 'k² = 36, not k.' },
  ] },
  { emoji: '🟩', title: 'Garden', story: 'A rectangular garden is 3 m longer than it is wide, with area 40 m². How wide is it?', idea: 'x(x + 3) = 40', options: [
    { text: '5 m', ok: true, why: 'x² + 3x − 40 = 0 → (x + 8)(x − 5).' },
    { text: '8 m', ok: false, why: 'That is the length.' },
    { text: '−8 m', ok: false, why: 'A width can’t be negative.' },
    { text: '4 m', ok: false, why: 'Check: 4 × 7 = 28.' },
  ] },
  { emoji: '🔢', title: 'nth term', story: 'What is the 20th term of the AP 3, 7, 11, …?', idea: 'aₙ = a + (n − 1)d', options: [
    { text: '79', ok: true, why: '3 + 19 × 4 = 79.' },
    { text: '83', ok: false, why: 'That uses n instead of n − 1.' },
    { text: '80', ok: false, why: 'Check the first term.' },
    { text: '76', ok: false, why: 'That is 19 × 4 only.' },
  ] },
  { emoji: '📏', title: 'How many terms', story: 'How many terms are in the AP 7, 13, 19, …, 205?', idea: 'Solve a + (n − 1)d = last', options: [
    { text: '34', ok: true, why: '7 + (n − 1)6 = 205, n − 1 = 33.' },
    { text: '33', ok: false, why: 'Add 1: n − 1 = 33.' },
    { text: '35', ok: false, why: 'Check: 7 + 34 × 6 = 211.' },
    { text: '198', ok: false, why: 'That is the difference 205 − 7.' },
  ] },
  { emoji: '➕', title: 'Sum', story: 'Find the sum of the first 30 positive odd numbers.', idea: 'Sₙ = n/2 (2a + (n − 1)d), or n²', options: [
    { text: '900', ok: true, why: 'Sum of first n odd numbers = n².' },
    { text: '930', ok: false, why: 'That adds n.' },
    { text: '450', ok: false, why: 'Half of the answer.' },
    { text: '59', ok: false, why: 'That is the 30th odd number.' },
  ] },
  { emoji: '💰', title: 'Savings', story: 'Riya saves ₹50 in week 1 and ₹10 more each week. How much has she saved after 12 weeks?', idea: 'AP sum with a = 50, d = 10', options: [
    { text: '₹1260', ok: true, why: 'S = 6 × (100 + 110) = 1260.' },
    { text: '₹160', ok: false, why: 'That is her week-12 saving.' },
    { text: '₹600', ok: false, why: 'That ignores the increase.' },
    { text: '₹1320', ok: false, why: 'Check: aₙ = 50 + 11 × 10 = 160; (50 + 160) × 6 = 1260.' },
  ] },
  { emoji: '🪜', title: 'Middle term', story: 'Which term of the AP 21, 18, 15, … is −81?', idea: 'aₙ = 21 + (n − 1)(−3)', options: [
    { text: '35th', ok: true, why: '21 − 3(n − 1) = −81 → n − 1 = 34.' },
    { text: '34th', ok: false, why: 'n − 1 = 34, so n = 35.' },
    { text: '36th', ok: false, why: 'Check: 21 − 105 = −84.' },
    { text: 'It is not a term', ok: false, why: '−81 is a term.' },
  ] },
]

export default function QuadraticMaster() {
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
      if (!useProgress.getState().badges.includes('quadratic-master')) addXp(25 + hearts * 10, 'Quadratic Master!')
      awardBadge('quadratic-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="quadratic-master" title="Boss Challenge: Quadratic Master" subtitle="Ten problems on quadratic equations, the discriminant and arithmetic progressions." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">📈</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Quadratic Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
