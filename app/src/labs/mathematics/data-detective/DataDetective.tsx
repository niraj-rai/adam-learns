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
  { emoji: '🏏', title: 'Batting average', story: 'Adam scores 4, 7, 9, 10 and 15 runs in five matches. What is his mean score?', idea: 'Mean = sum ÷ count', options: [
    { text: '9', ok: true, why: '45 ÷ 5 = 9.' },
    { text: '45', ok: false, why: 'That’s the total; divide by the number of matches.' },
    { text: '11', ok: false, why: 'That’s the range (15 − 4).' },
    { text: '7', ok: false, why: 'Check the sum: 4 + 7 + 9 + 10 + 15 = 45.' } ] },
  { emoji: '📏', title: 'Middle value', story: 'Find the median of 3, 8, 5, 12, 7, 10.', idea: 'Sort first; with an even count, average the middle two', options: [
    { text: '7.5', ok: true, why: 'Sorted: 3, 5, 7, 8, 10, 12. Middle two are 7 and 8, so 7.5.' },
    { text: '5', ok: false, why: 'You must sort the numbers first.' },
    { text: '8.5', ok: false, why: 'That averages 5 and 12, the middle pair of the unsorted list. Always sort first!' },
    { text: '8', ok: false, why: 'With six values, average the 3rd and 4th.' } ] },
  { emoji: '👟', title: 'Shoe sizes', story: 'Shoe sizes in a group: 2, 3, 3, 5, 7, 7, 7, 9. What is the mode?', idea: 'Mode = most common value', options: [
    { text: '7', ok: true, why: '7 appears three times.' },
    { text: '3', ok: false, why: '3 appears twice; 7 appears three times.' },
    { text: '5.375', ok: false, why: 'That’s the mean.' },
    { text: '6', ok: false, why: 'That’s the median.' } ] },
  { emoji: '🌡️', title: 'Temperature spread', story: 'Four readings: 12°, 45°, 23°, 38°. What is the range?', idea: 'Range = largest − smallest', options: [
    { text: '33°', ok: true, why: '45 − 12 = 33.' },
    { text: '45°', ok: false, why: 'That’s the largest value.' },
    { text: '29.5°', ok: false, why: 'That’s the mean.' },
    { text: '57°', ok: false, why: 'Subtract, don’t add.' } ] },
  { emoji: '🥧', title: 'Pie slice', story: '30 of 120 students chose cricket. How big is the cricket slice in a pie chart?', idea: 'Angle = value ÷ total × 360°', options: [
    { text: '90°', ok: true, why: '30 ÷ 120 = ¼, and ¼ of 360° is 90°.' },
    { text: '30°', ok: false, why: 'Convert the fraction to degrees.' },
    { text: '25°', ok: false, why: '25% isn’t 25°.' },
    { text: '120°', ok: false, why: 'That’s the total number of students.' } ] },
  { emoji: '📦', title: 'Class interval', story: 'Heights are grouped as 140–145, 145–150, … Where does a height of exactly 145 cm go?', idea: 'Lower limit included, upper limit excluded', options: [
    { text: 'In 145–150', ok: true, why: 'Each class includes its lower limit.' },
    { text: 'In 140–145', ok: false, why: 'The upper limit isn’t included.' },
    { text: 'In both', ok: false, why: 'Each value is counted exactly once.' },
    { text: 'In neither', ok: false, why: 'Every value must go somewhere.' } ] },
  { emoji: '🎲', title: 'Even roll', story: 'You roll a fair die. What is the probability of an even number?', idea: 'Favourable ÷ total', options: [
    { text: '1/2', ok: true, why: '2, 4 and 6: 3 out of 6.' },
    { text: '1/6', ok: false, why: 'That’s for one particular number.' },
    { text: '1/3', ok: false, why: 'There are 3 even numbers, not 2.' },
    { text: '3', ok: false, why: 'Probabilities are between 0 and 1.' } ] },
  { emoji: '🎲🎲', title: 'Lucky seven', story: 'Two dice are rolled and added. What is the probability of a total of 7?', idea: '6 of the 36 outcomes make 7', options: [
    { text: '1/6', ok: true, why: '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1): 6/36 = 1/6.' },
    { text: '1/11', ok: false, why: 'The totals 2–12 are not equally likely.' },
    { text: '1/12', ok: false, why: 'Count the pairs in the 6 × 6 grid.' },
    { text: '7/36', ok: false, why: 'Only 6 pairs add to 7.' } ] },
  { emoji: '🔴', title: 'Marble bag', story: 'A bag has 3 red and 5 blue marbles. One is picked without looking. What is P(red)?', idea: 'Red ÷ total', options: [
    { text: '3/8', ok: true, why: '3 red out of 8 marbles.' },
    { text: '3/5', ok: false, why: 'That compares red with blue, not with the total.' },
    { text: '1/2', ok: false, why: 'The colours aren’t equally common.' },
    { text: '5/8', ok: false, why: 'That’s P(blue).' } ] },
  { emoji: '📰', title: 'Suspicious graph', story: 'A bar chart’s vertical axis starts at 90 instead of 0. Sales of 95 and 100 look like one bar is double the other. What is going on?', idea: 'Check where the axis starts', options: [
    { text: 'The cut axis exaggerates a small difference', ok: true, why: '100 is only about 5% more than 95.' },
    { text: 'Sales really doubled', ok: false, why: '100 isn’t double 95.' },
    { text: 'The graph is fine', ok: false, why: 'Bar charts should start at 0.' },
    { text: 'The bars are the wrong colour', ok: false, why: 'Colour isn’t the problem here.' } ] },
]

export default function DataDetective() {
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
      if (!useProgress.getState().badges.includes('data-detective')) addXp(25 + hearts * 10, 'Data Detective!')
      awardBadge('data-detective')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="data-detective" title="Boss Challenge: Data Detective" subtitle="Ten cases on averages, charts and chance." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🕵️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Data Detective! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
