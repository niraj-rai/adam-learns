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
  { emoji: '🔢', title: 'Big number', story: 'How do you write “two lakh five thousand thirty” in numerals?', idea: 'Lakhs, thousands, ones', options: [
    { text: '2,05,030', ok: true, why: '2 lakh + 5 thousand + 30.' },
    { text: '2,50,030', ok: false, why: 'That is fifty thousand.' },
    { text: '20,05,030', ok: false, why: 'That is twenty lakh.' },
    { text: '2,05,300', ok: false, why: 'That is three hundred.' },
  ] },
  { emoji: '🥛', title: 'Dairy farm', story: 'A dairy collects 125 litres of milk a day. How much in 8 days?', idea: 'Multiply', options: [
    { text: '1000 litres', ok: true, why: '125 × 8 = 1000.' },
    { text: '133 litres', ok: false, why: 'That adds 8.' },
    { text: '800 litres', ok: false, why: 'Check 125 × 8.' },
    { text: '1250 litres', ok: false, why: 'That is 10 days.' },
  ] },
  { emoji: '🍕', title: 'Fractions', story: 'Which fraction is bigger: 3/4 or 2/3?', idea: 'Compare using twelfths', options: [
    { text: '3/4', ok: true, why: '9/12 is more than 8/12.' },
    { text: '2/3', ok: false, why: '8/12 is less than 9/12.' },
    { text: 'They are equal', ok: false, why: '9/12 and 8/12 differ.' },
    { text: 'Cannot tell', ok: false, why: 'Use equal denominators.' },
  ] },
  { emoji: '🍫', title: 'Share', story: 'Half of a chocolate bar is shared equally by 2 friends. What fraction does each get?', idea: 'Half of a half', options: [
    { text: '1/4', ok: true, why: '½ ÷ 2 = ¼.' },
    { text: '1/2', ok: false, why: 'That is before sharing.' },
    { text: '1/3', ok: false, why: 'Two shares of a half make quarters.' },
    { text: '2/4', ok: false, why: 'That is the whole half.' },
  ] },
  { emoji: '🧭', title: 'Turn', story: 'You face North and make a quarter turn clockwise. Which way do you face?', idea: 'A quarter turn is 90°', options: [
    { text: 'East', ok: true, why: 'N → E is a quarter turn clockwise.' },
    { text: 'West', ok: false, why: 'That is anticlockwise.' },
    { text: 'South', ok: false, why: 'That is a half turn.' },
    { text: 'North', ok: false, why: 'That is a full turn.' },
  ] },
  { emoji: '📐', title: 'Right angle', story: 'How many degrees is a right angle?', idea: 'A quarter of a full turn', options: [
    { text: '90°', ok: true, why: '360 ÷ 4 = 90.' },
    { text: '180°', ok: false, why: 'That is a straight angle.' },
    { text: '45°', ok: false, why: 'That is half a right angle.' },
    { text: '360°', ok: false, why: 'That is a full turn.' },
  ] },
  { emoji: '📏', title: 'Distance', story: 'How many metres are there in 3 km 250 m?', idea: '1 km = 1000 m', options: [
    { text: '3250 m', ok: true, why: '3000 + 250.' },
    { text: '325 m', ok: false, why: '3 km is 3000 m.' },
    { text: '3025 m', ok: false, why: 'Check the 250.' },
    { text: '32,500 m', ok: false, why: 'Too many.' },
  ] },
  { emoji: '⚖️', title: 'Weight', story: 'A bag of rice weighs 2 kg 500 g. How many grams is that?', idea: '1 kg = 1000 g', options: [
    { text: '2500 g', ok: true, why: '2000 + 500.' },
    { text: '250 g', ok: false, why: '2 kg is 2000 g.' },
    { text: '2005 g', ok: false, why: 'Check the 500.' },
    { text: '25,000 g', ok: false, why: 'Too many.' },
  ] },
  { emoji: '⏱️', title: 'Race', story: 'A race takes 2 minutes 15 seconds. How many seconds is that?', idea: '1 minute = 60 seconds', options: [
    { text: '135 seconds', ok: true, why: '120 + 15.' },
    { text: '215 seconds', ok: false, why: 'A minute is 60 seconds, not 100.' },
    { text: '75 seconds', ok: false, why: 'Two minutes is 120 s.' },
    { text: '17 seconds', ok: false, why: 'Multiply the minutes by 60.' },
  ] },
  { emoji: '🦋', title: 'Symmetry', story: 'How many lines of symmetry does a square have?', idea: 'Fold it in different ways', options: [
    { text: '4', ok: true, why: '2 through the middles of the sides and 2 along the diagonals.' },
    { text: '2', ok: false, why: 'Don’t forget the diagonals.' },
    { text: '1', ok: false, why: 'There are more.' },
    { text: '8', ok: false, why: 'Too many.' },
  ] },
]

export default function MelaMaster() {
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
      if (!useProgress.getState().badges.includes('mela-master')) addXp(25 + hearts * 10, 'Maths Mela Master!')
      awardBadge('mela-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="mela-master" title="Boss Challenge: Maths Mela Master" subtitle="Ten Grade 5 puzzles about big numbers, fractions, angles, measurement and data." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🎡</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Maths Mela Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
