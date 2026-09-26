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
  { emoji: '📍', title: 'Distance', story: 'Find the distance between (1, 2) and (7, 10).', idea: 'd = √[(x₂ − x₁)² + (y₂ − y₁)²]', options: [
    { text: '10', ok: true, why: '√(6² + 8²) = √100 = 10.' },
    { text: '14', ok: false, why: 'That adds 6 and 8; use Pythagoras.' },
    { text: '√14', ok: false, why: 'Square the differences first.' },
    { text: '100', ok: false, why: 'Take the square root.' },
  ] },
  { emoji: '🎯', title: 'Midpoint', story: 'Find the midpoint of (−4, 3) and (6, 9).', idea: 'Average the coordinates', options: [
    { text: '(1, 6)', ok: true, why: '((−4 + 6)/2, (3 + 9)/2) = (1, 6).' },
    { text: '(2, 12)', ok: false, why: 'Divide the sums by 2.' },
    { text: '(5, 3)', ok: false, why: 'Subtract? No: add and halve.' },
    { text: '(10, 6)', ok: false, why: 'The x-values are −4 and 6, which add to 2.' },
  ] },
  { emoji: '⛰️', title: 'Slope', story: 'What is the slope of the line through (2, 3) and (6, 11)?', idea: 'Slope = rise ÷ run', options: [
    { text: '2', ok: true, why: '(11 − 3) ÷ (6 − 2) = 8 ÷ 4 = 2.' },
    { text: '1/2', ok: false, why: 'That’s run ÷ rise.' },
    { text: '8', ok: false, why: 'Divide by the run of 4.' },
    { text: '4', ok: false, why: 'That’s the run.' },
  ] },
  { emoji: '✏️', title: 'Read the equation', story: 'For y = −3x + 5, what are the slope and y-intercept?', idea: 'y = mx + c', options: [
    { text: 'Slope −3, intercept 5', ok: true, why: 'm = −3 and c = 5.' },
    { text: 'Slope 5, intercept −3', ok: false, why: 'They’re the other way round.' },
    { text: 'Slope 3, intercept 5', ok: false, why: 'The slope is negative.' },
    { text: 'Slope −3, intercept −5', ok: false, why: 'c = +5.' },
  ] },
  { emoji: '0️⃣', title: 'Zero of a polynomial', story: 'What is the zero of p(x) = 2x − 8?', idea: 'Solve p(x) = 0', options: [
    { text: 'x = 4', ok: true, why: '2x − 8 = 0 gives x = 4.' },
    { text: 'x = −4', ok: false, why: 'Check: 2(−4) − 8 = −16, not 0.' },
    { text: 'x = 8', ok: false, why: '2(8) − 8 = 8, not 0.' },
    { text: 'x = −8', ok: false, why: 'That’s the constant term.' },
  ] },
  { emoji: '🤝', title: 'Solve the pair', story: 'Solve x + y = 12 and x − y = 4.', idea: 'Add the equations to eliminate y', options: [
    { text: 'x = 8, y = 4', ok: true, why: '2x = 16 so x = 8; then y = 4.' },
    { text: 'x = 4, y = 8', ok: false, why: 'Check the second equation: 4 − 8 = −4.' },
    { text: 'x = 6, y = 6', ok: false, why: '6 − 6 = 0, not 4.' },
    { text: 'x = 16, y = −4', ok: false, why: 'Divide 16 by 2.' },
  ] },
  { emoji: '🛤️', title: 'Parallel', story: 'How many solutions do 2x + 3y = 6 and 4x + 6y = 5 have?', idea: 'Same slope, different intercept means parallel lines', options: [
    { text: 'None', ok: true, why: 'The second is not a multiple of the first on the right-hand side: the lines are parallel.' },
    { text: 'One', ok: false, why: 'The lines have the same slope, so they never cross.' },
    { text: 'Infinitely many', ok: false, why: 'They would need 4x + 6y = 12.' },
    { text: 'Two', ok: false, why: 'Two straight lines meet at most once.' },
  ] },
  { emoji: '🎫', title: 'Ticket problem', story: 'Adult tickets cost ₹50 and child tickets ₹20. 10 tickets cost ₹320. How many adult tickets?', idea: 'Write two equations and solve', options: [
    { text: '4', ok: true, why: 'a + c = 10 and 50a + 20c = 320 give 30a = 120, a = 4.' },
    { text: '6', ok: false, why: 'That’s the number of child tickets.' },
    { text: '5', ok: false, why: 'Check: 5 × 50 + 5 × 20 = 350.' },
    { text: '8', ok: false, why: 'Check: 8 × 50 = 400, already too much.' },
  ] },
  { emoji: '🔀', title: 'Which quadrant?', story: 'In which quadrant does the point (−3, 5) lie?', idea: 'Signs of (x, y) decide the quadrant', options: [
    { text: 'Second', ok: true, why: 'x negative, y positive: quadrant II.' },
    { text: 'First', ok: false, why: 'Both coordinates would be positive.' },
    { text: 'Third', ok: false, why: 'Both would be negative.' },
    { text: 'Fourth', ok: false, why: 'x positive, y negative.' },
  ] },
  { emoji: '📏', title: 'Point on the line', story: 'Which point lies on the line y = 2x − 1?', idea: 'Substitute x and check y', options: [
    { text: '(3, 5)', ok: true, why: '2 × 3 − 1 = 5. ✔' },
    { text: '(2, 5)', ok: false, why: '2 × 2 − 1 = 3, not 5.' },
    { text: '(0, 1)', ok: false, why: '2 × 0 − 1 = −1.' },
    { text: '(5, 3)', ok: false, why: '2 × 5 − 1 = 9.' },
  ] },
]

export default function CoordinateCommander() {
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
      if (!useProgress.getState().badges.includes('coordinate-commander')) addXp(25 + hearts * 10, 'Coordinate Commander!')
      awardBadge('coordinate-commander')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="coordinate-commander" title="Boss Challenge: Coordinate Commander" subtitle="Ten problems on distance, midpoints, slopes and pairs of linear equations." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧭</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Coordinate Commander! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
