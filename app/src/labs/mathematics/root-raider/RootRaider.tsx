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
  { emoji: '🟩', title: 'Garden plot', story: 'A square garden has an area of 196 m². How long is each side?', idea: 'Side of a square = √area', options: [
    { text: '14 m', ok: true, why: '14 × 14 = 196, so √196 = 14 m.' },
    { text: '98 m', ok: false, why: 'That halves 196. A square root undoes squaring, not doubling.' },
    { text: '49 m', ok: false, why: '49 × 4 = 196: that is dividing the area among 4 sides, which isn’t how area works.' },
    { text: '13 m', ok: false, why: '13² = 169, too small.' } ] },
  { emoji: '🔚', title: 'Spot the square', story: 'Exactly one of these is a perfect square. Which one?', idea: 'Last digits and nearby squares', options: [
    { text: '1764', ok: true, why: '42² = 1764.' },
    { text: '2022', ok: false, why: 'Squares never end in 2.' },
    { text: '1682', ok: false, why: 'It ends in 2, so it can’t be a square (41² = 1681 is close!).' },
    { text: '1350', ok: false, why: 'Ending in 0 is possible, but a square ending in 0 must end in 00.' } ] },
  { emoji: '🧊', title: 'Ice cube tray', story: 'A big block of ice is made from 2744 small cubes. How many cubes long is each edge?', idea: 'Cube root: group primes in threes', options: [
    { text: '14', ok: true, why: '2744 = 2³ × 7³, so ∛2744 = 2 × 7 = 14.' },
    { text: '12', ok: false, why: '12³ = 1728, too small.' },
    { text: '16', ok: false, why: '16³ = 4096, too big.' },
    { text: '52', ok: false, why: '52² = 2704: that’s a square root guess, not a cube root.' } ] },
  { emoji: '🗜️', title: 'Squeeze it', story: 'Between which two whole numbers does √90 lie?', idea: 'Trap a root between perfect squares', options: [
    { text: 'Between 9 and 10', ok: true, why: '81 < 90 < 100, so 9 < √90 < 10 (it’s about 9.49).' },
    { text: 'Between 44 and 46', ok: false, why: 'That’s about 90 ÷ 2, not √90.' },
    { text: 'Between 8 and 9', ok: false, why: '9² = 81 is still less than 90.' },
    { text: 'Between 10 and 11', ok: false, why: '10² = 100 is already more than 90.' } ] },
  { emoji: '✖️', title: 'Make it square', story: 'What is the smallest number you can multiply 72 by to get a perfect square?', idea: 'Every prime needs a partner', options: [
    { text: '2', ok: true, why: '72 = 2³ × 3². One 2 is unpaired, so 72 × 2 = 144 = 12².' },
    { text: '3', ok: false, why: '72 × 3 = 216 = 2³ × 3³: now both primes are unpaired.' },
    { text: '4', ok: false, why: '72 × 4 = 288 = 2⁵ × 3², still an unpaired 2.' },
    { text: '8', ok: false, why: '72 × 8 = 576 = 24² works, but it isn’t the smallest.' } ] },
  { emoji: '🟠', title: 'Odd stairs', story: 'Work out 1 + 3 + 5 + 7 + … + 19.', idea: 'The first n odd numbers add up to n²', options: [
    { text: '100', ok: true, why: 'There are 10 odd numbers from 1 to 19, so the sum is 10² = 100.' },
    { text: '190', ok: false, why: 'That’s 19 × 10. Count the odd numbers, then square.' },
    { text: '81', ok: false, why: 'That’s 9²: there are 10 odd numbers, not 9.' },
    { text: '110', ok: false, why: 'Check: 1 + 3 + 5 + 7 + 9 = 25 = 5² already.' } ] },
  { emoji: '🚪', title: 'Fifty lockers', story: 'In the locker puzzle with 50 lockers and 50 people, how many lockers end up open?', idea: 'Only perfect squares have an odd number of factors', options: [
    { text: '7', ok: true, why: 'Open lockers are the squares up to 50: 1, 4, 9, 16, 25, 36, 49.' },
    { text: '25', ok: false, why: 'Half the lockers? Only squares stay open.' },
    { text: '5', ok: false, why: 'Don’t forget 36 and 49.' },
    { text: '10', ok: false, why: 'That would be for 100 lockers.' } ] },
  { emoji: '🔢', title: 'Divisibility dash', story: 'Which of these numbers is divisible by 9?', idea: 'Digit sum divisible by 9', options: [
    { text: '7632', ok: true, why: '7 + 6 + 3 + 2 = 18, and 18 is divisible by 9. Check: 7632 ÷ 9 = 848.' },
    { text: '7634', ok: false, why: 'Digit sum 20, not a multiple of 9.' },
    { text: '4528', ok: false, why: 'Digit sum 19, not a multiple of 9.' },
    { text: '1000', ok: false, why: 'Digit sum 1: 1000 leaves remainder 1 when divided by 9.' } ] },
  { emoji: '🟫', title: 'Which is a cube?', story: 'Which of these is a perfect cube?', idea: 'Group prime factors in threes', options: [
    { text: '3375', ok: true, why: '3375 = 3³ × 5³ = 15³.' },
    { text: '3600', ok: false, why: '3600 = 60²: a square, not a cube.' },
    { text: '2500', ok: false, why: '2500 = 50²: a square, not a cube.' },
    { text: '4000', ok: false, why: '4000 = 2⁵ × 5³: the 2s don’t make full triples.' } ] },
  { emoji: '🚕', title: 'Ramanujan’s taxi', story: '1729 = 1³ + 12³. It is also ?³ + 10³. What is the missing number?', idea: '1729 is the smallest taxicab number', options: [
    { text: '9', ok: true, why: '9³ + 10³ = 729 + 1000 = 1729.' },
    { text: '11', ok: false, why: '11³ = 1331, and 1331 + 1000 is too big.' },
    { text: '7', ok: false, why: '7³ + 10³ = 343 + 1000 = 1343.' },
    { text: '8', ok: false, why: '8³ + 10³ = 512 + 1000 = 1512.' } ] },
]

export default function RootRaider() {
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
      if (!useProgress.getState().badges.includes('root-raider')) addXp(25 + hearts * 10, 'Root Raider!')
      awardBadge('root-raider')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="root-raider" title="Boss Challenge: Root Raider" subtitle="Ten problems on squares, cubes, roots and number patterns." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏴‍☠️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Root Raider! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
