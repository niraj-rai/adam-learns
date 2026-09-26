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
  { emoji: '🔢', title: 'Degree', story: 'What is the degree of 5x³ − 2x⁴ + x − 7?', idea: 'Degree = highest power', options: [
    { text: '4', ok: true, why: 'The highest power of x is 4.' },
    { text: '3', ok: false, why: 'Look for the highest power, not the first term.' },
    { text: '5', ok: false, why: 'That’s a coefficient.' },
    { text: '−7', ok: false, why: 'That’s the constant term.' },
  ] },
  { emoji: '🎯', title: 'Value', story: 'If p(x) = x² − 3x + 2, find p(−1).', idea: 'Substitute carefully with brackets', options: [
    { text: '6', ok: true, why: '1 + 3 + 2 = 6.' },
    { text: '0', ok: false, why: 'p(1) = 0, but we want p(−1).' },
    { text: '−2', ok: false, why: '(−1)² = +1 and −3(−1) = +3.' },
    { text: '4', ok: false, why: 'Check the signs again.' },
  ] },
  { emoji: '🧩', title: 'Remainder theorem', story: 'Find the remainder when x³ − 4x + 5 is divided by (x − 2).', idea: 'Remainder = p(2)', options: [
    { text: '5', ok: true, why: 'p(2) = 8 − 8 + 5 = 5.' },
    { text: '−5', ok: false, why: 'Use x = 2, not −2.' },
    { text: '0', ok: false, why: 'That would make (x − 2) a factor.' },
    { text: '21', ok: false, why: 'p(2) = 8 − 8 + 5.' },
  ] },
  { emoji: '✅', title: 'Factor theorem', story: 'Which of these is a factor of x² − 7x + 12?', idea: '(x − a) is a factor if p(a) = 0', options: [
    { text: '(x − 3)', ok: true, why: 'p(3) = 9 − 21 + 12 = 0.' },
    { text: '(x + 3)', ok: false, why: 'p(−3) = 9 + 21 + 12 = 42.' },
    { text: '(x − 2)', ok: false, why: 'p(2) = 4 − 14 + 12 = 2.' },
    { text: '(x + 4)', ok: false, why: 'p(−4) = 16 + 28 + 12 = 56.' },
  ] },
  { emoji: '🔍', title: 'Find k', story: 'If (x − 1) is a factor of x² + kx + 3, find k.', idea: 'Set p(1) = 0', options: [
    { text: '−4', ok: true, why: '1 + k + 3 = 0, so k = −4.' },
    { text: '4', ok: false, why: 'Check: 1 + 4 + 3 = 8, not 0.' },
    { text: '3', ok: false, why: 'Solve 1 + k + 3 = 0.' },
    { text: '−3', ok: false, why: '1 − 3 + 3 = 1, not 0.' },
  ] },
  { emoji: '🧊', title: 'Cube identity', story: 'Expand (x + 2)³.', idea: '(a + b)³ = a³ + 3a²b + 3ab² + b³', options: [
    { text: 'x³ + 6x² + 12x + 8', ok: true, why: '3·x²·2 = 6x² and 3·x·4 = 12x.' },
    { text: 'x³ + 8', ok: false, why: 'That misses the middle terms.' },
    { text: 'x³ + 6x + 8', ok: false, why: 'There should be an x² term too.' },
    { text: 'x³ + 3x² + 3x + 8', ok: false, why: 'Multiply by the 2s in 3a²b and 3ab².' },
  ] },
  { emoji: '⚡', title: 'Quick calculation', story: 'Use an identity to work out 99² without a calculator.', idea: '(a − b)² = a² − 2ab + b²', options: [
    { text: '9801', ok: true, why: '(100 − 1)² = 10000 − 200 + 1 = 9801.' },
    { text: '9901', ok: false, why: 'Subtract 2 × 100 × 1 = 200.' },
    { text: '9999', ok: false, why: 'That’s 99 × 101.' },
    { text: '8901', ok: false, why: 'Check the subtraction.' },
  ] },
  { emoji: '🌈', title: 'Three squares', story: 'Expand (a + b + c)².', idea: 'Three squares plus twice each product', options: [
    { text: 'a² + b² + c² + 2ab + 2bc + 2ca', ok: true, why: 'Each pair appears twice in the 3 × 3 area model.' },
    { text: 'a² + b² + c²', ok: false, why: 'You’ve missed the product terms.' },
    { text: 'a² + b² + c² + ab + bc + ca', ok: false, why: 'Each product appears twice.' },
    { text: 'a² + b² + c² + 2abc', ok: false, why: 'The cross terms are products of pairs.' },
  ] },
  { emoji: '🎩', title: 'Clever identity', story: 'If a + b + c = 0, then a³ + b³ + c³ equals…', idea: 'a³ + b³ + c³ − 3abc = (a + b + c)(…)', options: [
    { text: '3abc', ok: true, why: 'With a + b + c = 0 the right-hand side is 0, so a³ + b³ + c³ = 3abc.' },
    { text: '0', ok: false, why: 'Try a = 1, b = 1, c = −2: 1 + 1 − 8 = −6.' },
    { text: 'abc', ok: false, why: 'It’s 3 times abc.' },
    { text: '(abc)³', ok: false, why: 'The identity gives 3abc.' },
  ] },
  { emoji: '🧱', title: 'Factorise', story: 'Factorise x² − 9.', idea: 'a² − b² = (a + b)(a − b)', options: [
    { text: '(x + 3)(x − 3)', ok: true, why: 'Difference of two squares.' },
    { text: '(x − 3)²', ok: false, why: 'That gives x² − 6x + 9.' },
    { text: '(x + 9)(x − 1)', ok: false, why: 'That gives x² + 8x − 9.' },
    { text: 'x(x − 9)', ok: false, why: 'That gives x² − 9x.' },
  ] },
]

export default function PolynomialPower() {
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
      if (!useProgress.getState().badges.includes('polynomial-power')) addXp(25 + hearts * 10, 'Polynomial Power!')
      awardBadge('polynomial-power')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="polynomial-power" title="Boss Challenge: Polynomial Power" subtitle="Ten problems on degree, zeros, the remainder and factor theorems, and identities." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">📈</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Polynomial Power! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
