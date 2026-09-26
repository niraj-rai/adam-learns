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
  { emoji: '🧺', title: 'Collect like terms', story: 'Simplify 5x + 3 − 2x + 4.', idea: 'Only like terms combine', options: [
    { text: '3x + 7', ok: true, why: '5x − 2x = 3x and 3 + 4 = 7.' },
    { text: '10x', ok: false, why: 'x-terms and numbers are unlike terms, so they can’t be added together.' },
    { text: '7x + 7', ok: false, why: 'It’s 5x minus 2x, not plus.' },
    { text: '3x + 1', ok: false, why: '+3 and +4 make 7.' } ] },
  { emoji: '🔢', title: 'Substitute', story: 'Find the value of 2x² − 3 when x = −2.', idea: 'Square first, and a negative squared is positive', options: [
    { text: '5', ok: true, why: 'x² = (−2)² = 4, so 2 × 4 − 3 = 5.' },
    { text: '−11', ok: false, why: '(−2)² is +4, not −4.' },
    { text: '13', ok: false, why: 'That squares 2x: only x is squared.' },
    { text: '−7', ok: false, why: 'That uses 2 × (−2) instead of 2 × (−2)².' } ] },
  { emoji: '📦', title: 'Open the bracket', story: 'Expand 3(2x − 5).', idea: 'Distribute to every term inside', options: [
    { text: '6x − 15', ok: true, why: '3 × 2x = 6x and 3 × (−5) = −15.' },
    { text: '6x − 5', ok: false, why: 'The 3 multiplies the −5 too.' },
    { text: '5x − 15', ok: false, why: '3 × 2x is 6x, not 5x.' },
    { text: '6x + 15', ok: false, why: '3 × (−5) is negative.' } ] },
  { emoji: '🟦', title: 'Two brackets', story: 'Expand (x + 4)(x + 3).', idea: 'Four areas: x², 3x, 4x and 12', options: [
    { text: 'x² + 7x + 12', ok: true, why: 'x² + 3x + 4x + 12 = x² + 7x + 12.' },
    { text: 'x² + 12', ok: false, why: 'You’ve missed the two middle rectangles, 3x and 4x.' },
    { text: 'x² + 12x + 7', ok: false, why: 'The x-terms add (4 + 3); the numbers multiply (4 × 3).' },
    { text: '2x + 7', ok: false, why: 'x × x = x², not 2x.' } ] },
  { emoji: '🟨', title: 'Identity check', story: 'Which is equal to (a + b)²?', idea: 'The square has four pieces', options: [
    { text: 'a² + 2ab + b²', ok: true, why: 'a², b², and two ab rectangles.' },
    { text: 'a² + b²', ok: false, why: 'That misses the two ab rectangles: (3 + 4)² = 49, but 9 + 16 = 25.' },
    { text: 'a² + ab + b²', ok: false, why: 'There are two ab rectangles, not one.' },
    { text: '2a + 2b', ok: false, why: 'That’s 2(a + b), not (a + b)².' } ] },
  { emoji: '🧠', title: 'Mental square', story: 'Use an identity to work out 102².', idea: '(a + b)² with a = 100, b = 2', options: [
    { text: '10,404', ok: true, why: '100² + 2 × 100 × 2 + 2² = 10,000 + 400 + 4.' },
    { text: '10,004', ok: false, why: 'You forgot the 2ab = 400 term.' },
    { text: '10,400', ok: false, why: 'Don’t forget b² = 4.' },
    { text: '1,044', ok: false, why: '102² is a bit more than 100² = 10,000.' } ] },
  { emoji: '✂️', title: 'Difference of squares', story: 'Work out 99 × 101.', idea: '(a − b)(a + b) = a² − b²', options: [
    { text: '9,999', ok: true, why: '(100 − 1)(100 + 1) = 100² − 1² = 9,999.' },
    { text: '10,000', ok: false, why: 'Close: subtract 1² = 1.' },
    { text: '10,001', ok: false, why: 'It’s a² minus b², not plus.' },
    { text: '9,900', ok: false, why: 'That’s 99 × 100.' } ] },
  { emoji: '🧩', title: 'Factorise', story: 'Factorise x² + 5x + 6.', idea: 'Find two numbers that multiply to 6 and add to 5', options: [
    { text: '(x + 2)(x + 3)', ok: true, why: '2 × 3 = 6 and 2 + 3 = 5.' },
    { text: '(x + 1)(x + 6)', ok: false, why: '1 × 6 = 6, but 1 + 6 = 7.' },
    { text: '(x + 5)(x + 1)', ok: false, why: '5 × 1 = 5, not 6.' },
    { text: 'x(x + 11)', ok: false, why: 'Expand it: x² + 11x.' } ] },
  { emoji: '🟫', title: 'Matchstick rule', story: 'A row of n squares uses 3n + 1 matchsticks. How many sticks for 20 squares?', idea: 'Substitute into the rule', options: [
    { text: '61', ok: true, why: '3 × 20 + 1 = 61.' },
    { text: '80', ok: false, why: 'Squares share sides, so it’s not 4 × 20.' },
    { text: '63', ok: false, why: '3 × 20 + 1, not 3 × (20 + 1).' },
    { text: '24', ok: false, why: '3 × 20 is 60, not 3 + 20.' } ] },
  { emoji: '🎩', title: 'Magic trick', story: 'Think of a number. Add 3. Double it. Subtract 6. Halve it. What do you always get?', idea: 'Use a letter-number to follow the steps', options: [
    { text: 'The number you started with', ok: true, why: 'x → x + 3 → 2x + 6 → 2x → x.' },
    { text: '3', ok: false, why: 'Follow it with x: 2x + 6 − 6 = 2x, then halve.' },
    { text: '0', ok: false, why: 'Try it with 5: 8, 16, 10, 5.' },
    { text: 'Double your number', ok: false, why: 'The last step halves it again.' } ] },
]

export default function AlgebraQuest() {
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
      if (!useProgress.getState().badges.includes('algebra-quest')) addXp(25 + hearts * 10, 'Algebra Champion!')
      awardBadge('algebra-quest')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="algebra-quest" title="Boss Challenge: Algebra Quest" subtitle="Ten problems on expressions, expanding, identities and factorising." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏆</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Algebra Champion! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
