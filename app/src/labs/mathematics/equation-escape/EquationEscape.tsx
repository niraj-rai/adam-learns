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
  { emoji: '🔓', title: 'Lock 1', story: 'Solve 3x + 5 = 20.', idea: 'Undo +5, then undo ×3', options: [
    { text: 'x = 5', ok: true, why: '3x = 15, so x = 5. Check: 15 + 5 = 20 ✓' },
    { text: 'x = 25/3', ok: false, why: 'That adds 5 instead of subtracting it.' },
    { text: 'x = 15', ok: false, why: 'You found 3x; now divide by 3.' },
    { text: 'x = 45', ok: false, why: 'Divide by 3; don’t multiply.' } ] },
  { emoji: '📦', title: 'Lock 2', story: 'Solve 2(x − 4) = 10.', idea: 'Expand (or divide) first', options: [
    { text: 'x = 9', ok: true, why: 'x − 4 = 5, so x = 9. Check: 2 × 5 = 10 ✓' },
    { text: 'x = 1', ok: false, why: 'x − 4 = 5 means add 4, not subtract.' },
    { text: 'x = 7', ok: false, why: '2(x − 4) = 2x − 8, not 2x − 4.' },
    { text: 'x = 3', ok: false, why: 'Check it: 2(3 − 4) = −2, not 10.' } ] },
  { emoji: '⚖️', title: 'Lock 3', story: 'Solve 5x − 3 = 2x + 12.', idea: 'Get the x terms on one side', options: [
    { text: 'x = 5', ok: true, why: '3x − 3 = 12, so 3x = 15 and x = 5.' },
    { text: 'x = 3', ok: false, why: 'Check: 5(3) − 3 = 12 but 2(3) + 12 = 18.' },
    { text: 'x = 15/7', ok: false, why: 'That comes from adding 2x to both sides (7x − 3 = 12). Subtract 2x instead.' },
    { text: 'x = 15', ok: false, why: '3x = 15, so divide by 3.' } ] },
  { emoji: '➗', title: 'Lock 4', story: 'Solve x/4 + 3 = 7.', idea: 'Undo +3, then multiply by 4', options: [
    { text: 'x = 16', ok: true, why: 'x/4 = 4, so x = 16.' },
    { text: 'x = 1', ok: false, why: 'x/4 = 4 means multiply by 4, not divide.' },
    { text: 'x = 40', ok: false, why: 'Subtract the 3 before multiplying by 4.' },
    { text: 'x = 28', ok: false, why: 'That’s 7 × 4: subtract 3 first.' } ] },
  { emoji: '👧', title: 'Lock 5', story: 'Adam is 3 times as old as his sister, and their ages add to 24. How old is his sister?', idea: 'Let s be her age: s + 3s = 24', options: [
    { text: '6 years', ok: true, why: '4s = 24, so s = 6 (Adam is 18).' },
    { text: '8 years', ok: false, why: '24 ÷ 3 = 8 forgets to add her own age: s + 3s = 4s.' },
    { text: '18 years', ok: false, why: 'That’s Adam’s age.' },
    { text: '21 years', ok: false, why: 'The ages must add to 24.' } ] },
  { emoji: '📍', title: 'Lock 6', story: 'Which quadrant is the point (−2, 3) in?', idea: 'x first: left is negative; then y: up is positive', options: [
    { text: 'Quadrant II', ok: true, why: 'Left 2, up 3: top-left is quadrant II.' },
    { text: 'Quadrant I', ok: false, why: 'Quadrant I has both coordinates positive.' },
    { text: 'Quadrant IV', ok: false, why: 'That would be (2, −3): check the order.' },
    { text: 'Quadrant III', ok: false, why: 'Quadrant III has both negative.' } ] },
  { emoji: '📈', title: 'Lock 7', story: 'Which point lies on the line y = 2x + 1?', idea: 'Substitute x and check y', options: [
    { text: '(3, 7)', ok: true, why: '2 × 3 + 1 = 7 ✓' },
    { text: '(7, 3)', ok: false, why: '2 × 7 + 1 = 15, not 3: order matters!' },
    { text: '(2, 4)', ok: false, why: '2 × 2 + 1 = 5.' },
    { text: '(0, 2)', ok: false, why: 'When x = 0, y = 1.' } ] },
  { emoji: '🛺', title: 'Lock 8', story: 'An auto fare is y = 15x + 30, where x is km and y is ₹. What does the 30 mean?', idea: 'c is the value when x = 0', options: [
    { text: 'A fixed ₹30 charged before you travel at all', ok: true, why: 'When x = 0 km, y = ₹30.' },
    { text: '₹30 for every km', ok: false, why: 'The per-km charge is the gradient, 15.' },
    { text: 'The trip is 30 km long', ok: false, why: 'x is the distance; 30 is money.' },
    { text: 'The maximum fare', ok: false, why: 'The fare keeps rising with distance.' } ] },
  { emoji: '🚶', title: 'Lock 9', story: 'On a distance–time graph of a walk, part of the line is flat (horizontal). What was happening?', idea: 'Flat means the distance isn’t changing', options: [
    { text: 'The walker had stopped', ok: true, why: 'Time passes but distance stays the same.' },
    { text: 'The walker was walking on flat ground', ok: false, why: 'A graph isn’t a picture of the road.' },
    { text: 'The walker was going very fast', ok: false, why: 'Fast would be a steep line.' },
    { text: 'The walker was going backwards', ok: false, why: 'That would make the line go down.' } ] },
  { emoji: '🔢', title: 'Final lock', story: 'Two consecutive numbers add up to 45. What are they?', idea: 'n + (n + 1) = 45', options: [
    { text: '22 and 23', ok: true, why: '2n + 1 = 45, so n = 22.' },
    { text: '20 and 25', ok: false, why: 'Consecutive means one after the other.' },
    { text: '22.5 and 22.5', ok: false, why: 'They must be different whole numbers.' },
    { text: '21 and 24', ok: false, why: 'These aren’t consecutive.' } ] },
]

export default function EquationEscape() {
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
      if (!useProgress.getState().badges.includes('equation-escape')) addXp(25 + hearts * 10, 'You escaped!')
      awardBadge('equation-escape')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="equation-escape" title="Boss Challenge: Equation Escape" subtitle="Ten locks to open with equations, coordinates and graphs." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🗝️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">You escaped! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next lock →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
