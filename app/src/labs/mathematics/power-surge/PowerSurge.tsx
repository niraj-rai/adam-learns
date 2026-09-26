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
  { emoji: '✖️', title: 'Same base', story: 'Simplify 2⁵ × 2³.', idea: 'Multiply: add the exponents', options: [
    { text: '2⁸', ok: true, why: 'Five 2s times three 2s is eight 2s: 2⁵⁺³ = 2⁸ = 256.' },
    { text: '2¹⁵', ok: false, why: 'Multiplying the exponents is the rule for a power of a power, not for multiplying.' },
    { text: '4⁸', ok: false, why: 'The base stays 2; only the exponents change.' },
    { text: '2²', ok: false, why: 'Subtracting exponents is the rule for dividing.' } ] },
  { emoji: '🔁', title: 'Power of a power', story: 'Simplify (3²)³.', idea: 'Power of a power: multiply the exponents', options: [
    { text: '3⁶', ok: true, why: 'Three groups of two 3s make six 3s: 3²ˣ³ = 3⁶ = 729.' },
    { text: '3⁵', ok: false, why: 'Adding is for multiplying two powers; here, it’s a power of a power.' },
    { text: '9⁶', ok: false, why: '3² is 9, so (3²)³ = 9³, not 9⁶.' },
    { text: '3⁹', ok: false, why: '2³ = 8 and 3² = 9 aren’t involved: the exponent is 2 × 3.' } ] },
  { emoji: '0️⃣', title: 'Zero power', story: 'What is 5⁰?', idea: 'Any non-zero number to the power 0 is 1', options: [
    { text: '1', ok: true, why: '5⁰ = 5¹ ÷ 5 = 1. The pattern down the power ladder gives 1.' },
    { text: '0', ok: false, why: 'It’s tempting, but 5³ ÷ 5³ = 1 and that equals 5⁰.' },
    { text: '5', ok: false, why: 'That’s 5¹.' },
    { text: 'It is undefined', ok: false, why: 'It’s defined: for any non-zero base, the answer is 1.' } ] },
  { emoji: '🪜', title: 'Below zero', story: 'What is 2⁻³?', idea: 'A negative exponent means “one over”', options: [
    { text: '1/8', ok: true, why: '2⁻³ = 1/2³ = 1/8.' },
    { text: '−8', ok: false, why: 'A negative exponent doesn’t make the answer negative.' },
    { text: '−6', ok: false, why: 'Don’t multiply the base by the exponent.' },
    { text: '1/6', ok: false, why: '2³ = 8, not 6.' } ] },
  { emoji: '🦠', title: 'Tiny virus', story: 'A virus is 0.00045 mm long. Write this in standard form.', idea: 'Small numbers have negative powers of 10', options: [
    { text: '4.5 × 10⁻⁴ mm', ok: true, why: 'Move the point 4 places right to get 4.5, so the power is −4.' },
    { text: '45 × 10⁻⁵ mm', ok: false, why: 'Equal in value, but a must be between 1 and 10 for standard form.' },
    { text: '4.5 × 10⁴ mm', ok: false, why: 'That’s 45,000 mm, which is huge!' },
    { text: '4.5 × 10⁻³ mm', ok: false, why: 'That’s 0.0045: count the places again.' } ] },
  { emoji: '☀️', title: 'To the Sun', story: 'The Sun is about 150,000,000 km from Earth. In standard form, that is…', idea: 'Count the places the point moves', options: [
    { text: '1.5 × 10⁸ km', ok: true, why: '150,000,000 = 1.5 × 100,000,000 = 1.5 × 10⁸.' },
    { text: '1.5 × 10⁷ km', ok: false, why: '10⁷ is 10,000,000: one zero too few.' },
    { text: '15 × 10⁷ km', ok: false, why: 'Right value, but 15 is not between 1 and 10.' },
    { text: '1.5 × 8¹⁰ km', ok: false, why: 'Standard form always uses powers of 10.' } ] },
  { emoji: '📄', title: 'Ten folds', story: 'Paper 0.1 mm thick is folded in half 10 times. About how thick is the stack?', idea: 'Doubling 10 times multiplies by 2¹⁰ = 1024', options: [
    { text: 'About 10 cm', ok: true, why: '0.1 mm × 1024 = 102.4 mm ≈ 10 cm.' },
    { text: '1 mm', ok: false, why: 'That’s 0.1 mm × 10: adding a layer each time, not doubling.' },
    { text: '2 mm', ok: false, why: 'That’s 0.1 × 2 × 10: doubling means multiplying by 2 each time.' },
    { text: 'About 1 m', ok: false, why: '1 m would need 13–14 folds.' } ] },
  { emoji: '⚖️', title: 'Which is bigger?', story: 'Which is bigger: 2¹⁰ or 10³?', idea: 'Work out powers carefully', options: [
    { text: '2¹⁰, because 1024 > 1000', ok: true, why: '2¹⁰ = 1024 and 10³ = 1000. This is why a kilobyte is sometimes 1024 bytes!' },
    { text: '10³, because 10 is bigger than 2', ok: false, why: 'The exponent matters too: 2¹⁰ = 1024.' },
    { text: 'They are equal', ok: false, why: 'Close, but 1024 ≠ 1000.' },
    { text: '10³, because 2 × 10 = 20 < 30', ok: false, why: '2¹⁰ is not 2 × 10.' } ] },
  { emoji: '💻', title: 'Computer code', story: 'What is the binary number 1101 in our decimal system?', idea: 'Binary place values are powers of 2', options: [
    { text: '13', ok: true, why: '1×8 + 1×4 + 0×2 + 1×1 = 13.' },
    { text: '1101', ok: false, why: 'In binary, the columns are 8, 4, 2, 1, not thousands and hundreds.' },
    { text: '11', ok: false, why: 'Check the 4s column: 8 + 4 + 1 = 13.' },
    { text: '3', ok: false, why: 'That just counts the 1s.' } ] },
  { emoji: '🏛️', title: 'Roman date', story: 'A building has MMXXVI carved above its door. What year is that?', idea: 'Roman numerals add symbol values', options: [
    { text: '2026', ok: true, why: 'MM = 2000, XX = 20, VI = 6.' },
    { text: '2016', ok: false, why: 'There are two Xs, so it’s 20.' },
    { text: '2024', ok: false, why: 'VI = 5 + 1 = 6; IV would be 4.' },
    { text: '1026', ok: false, why: 'M = 1000, and there are two of them.' } ] },
]

export default function PowerSurge() {
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
      if (!useProgress.getState().badges.includes('power-surge')) addXp(25 + hearts * 10, 'Power Surge!')
      awardBadge('power-surge')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="power-surge" title="Boss Challenge: Power Surge" subtitle="Ten problems on exponents, standard form and number systems." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">⚡</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Power Surge! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
