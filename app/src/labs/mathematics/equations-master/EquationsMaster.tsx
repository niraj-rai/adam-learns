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
  { emoji: '🌳', title: 'Prime factors', story: 'Write 360 as a product of primes.', idea: 'Fundamental Theorem of Arithmetic', options: [
    { text: '2³ × 3² × 5', ok: true, why: '8 × 9 × 5 = 360.' },
    { text: '2² × 3² × 10', ok: false, why: '10 is not prime.' },
    { text: '2³ × 3 × 15', ok: false, why: '15 is not prime.' },
    { text: '2 × 3 × 5 × 12', ok: false, why: '12 is not prime.' },
  ] },
  { emoji: '🔗', title: 'HCF × LCM', story: 'The HCF of two numbers is 6 and their product is 1080. What is their LCM?', idea: 'HCF × LCM = product of the two numbers', options: [
    { text: '180', ok: true, why: '1080 ÷ 6 = 180.' },
    { text: '6480', ok: false, why: 'That multiplies instead of dividing.' },
    { text: '1074', ok: false, why: 'Subtracting doesn’t work here.' },
    { text: '60', ok: false, why: 'Check: 6 × 60 = 360, not 1080.' },
  ] },
  { emoji: '🚌', title: 'Bus timings', story: 'Two buses leave a depot every 12 and 18 minutes. They both leave at 8:00. When do they next leave together?', idea: 'Next common time = LCM', options: [
    { text: '8:36', ok: true, why: 'LCM(12, 18) = 36 minutes.' },
    { text: '8:06', ok: false, why: 'That is the HCF.' },
    { text: '9:36', ok: false, why: 'That is 96 minutes later.' },
    { text: '8:30', ok: false, why: '30 isn’t a multiple of 12 or 18.' },
  ] },
  { emoji: '🧩', title: 'Terminating?', story: 'Without dividing, which fraction has a terminating decimal?', idea: 'Denominator of the form 2ᵐ5ⁿ', options: [
    { text: '13/125', ok: true, why: '125 = 5³.' },
    { text: '7/12', ok: false, why: '12 = 2² × 3 has a factor 3.' },
    { text: '11/30', ok: false, why: '30 has a factor 3.' },
    { text: '5/21', ok: false, why: '21 = 3 × 7.' },
  ] },
  { emoji: '➕', title: 'Sum of zeros', story: 'What is the sum of the zeros of 2x² − 8x + 5?', idea: 'Sum = −b/a', options: [
    { text: '4', ok: true, why: '−(−8)/2 = 4.' },
    { text: '−4', ok: false, why: 'Watch the sign: −b/a.' },
    { text: '5/2', ok: false, why: 'That is the product c/a.' },
    { text: '8', ok: false, why: 'Divide by a = 2.' },
  ] },
  { emoji: '✖️', title: 'Build a quadratic', story: 'Which quadratic has zeros whose sum is 5 and product is 6?', idea: 'x² − (sum)x + product', options: [
    { text: 'x² − 5x + 6', ok: true, why: 'Zeros 2 and 3.' },
    { text: 'x² + 5x + 6', ok: false, why: 'That gives a sum of −5.' },
    { text: 'x² − 6x + 5', ok: false, why: 'Sum and product are swapped.' },
    { text: 'x² + 5x − 6', ok: false, why: 'Sum −5, product −6.' },
  ] },
  { emoji: '✏️', title: 'Pens and pencils', story: '2 pens and 3 pencils cost ₹34; 1 pen and 1 pencil cost ₹13. What does a pen cost?', idea: 'Eliminate one variable', options: [
    { text: '₹5', ok: true, why: 'Pencil = 13 − p; 2p + 39 − 3p = 34, so p = 5.' },
    { text: '₹8', ok: false, why: 'That is the pencil.' },
    { text: '₹13', ok: false, why: 'That is the pair.' },
    { text: '₹6', ok: false, why: 'Check: 12 + 21 = 33, not 34.' },
  ] },
  { emoji: '∥', title: 'Parallel lines', story: 'For which value of k do 2x + 3y = 5 and 4x + ky = 7 have no solution?', idea: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂', options: [
    { text: 'k = 6', ok: true, why: '2/4 = 3/6 ≠ 5/7.' },
    { text: 'k = 3', ok: false, why: '2/4 ≠ 3/3.' },
    { text: 'k = 4', ok: false, why: '2/4 ≠ 3/4.' },
    { text: 'k = 7', ok: false, why: '2/4 ≠ 3/7.' },
  ] },
  { emoji: '♾️', title: 'Same line', story: 'x + 2y = 3 and 3x + 6y = 9. How many solutions?', idea: 'Check all three ratios', options: [
    { text: 'Infinitely many', ok: true, why: 'Both ratios equal 1/3: the lines coincide.' },
    { text: 'None', ok: false, why: 'The lines are not parallel and separate.' },
    { text: 'Exactly one', ok: false, why: 'They are the same line.' },
    { text: 'Two', ok: false, why: 'Two straight lines can’t meet twice.' },
  ] },
  { emoji: '👨\u200d👧', title: 'Ages', story: 'A father is 3 times as old as his daughter. In 12 years he will be twice as old. How old is the daughter now?', idea: 'f = 3d and f + 12 = 2(d + 12)', options: [
    { text: '12', ok: true, why: '3d + 12 = 2d + 24, so d = 12 (father 36).' },
    { text: '24', ok: false, why: 'That is the daughter in 12 years.' },
    { text: '36', ok: false, why: 'That is the father.' },
    { text: '6', ok: false, why: 'Check: father 18, in 12 years 30 and 18: not twice.' },
  ] },
]

export default function EquationsMaster() {
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
      if (!useProgress.getState().badges.includes('equations-master')) addXp(25 + hearts * 10, 'Equations Master!')
      awardBadge('equations-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="equations-master" title="Boss Challenge: Equations Master" subtitle="Ten problems on primes, HCF and LCM, zeros of polynomials and pairs of linear equations." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧮</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Equations Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
