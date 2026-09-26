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
  { emoji: '🔺', title: 'Garden bed', story: 'A triangular garden bed has a base of 10 m and a height of 6 m. What is its area?', idea: 'Triangle = ½ × base × height', options: [
    { text: '30 m²', ok: true, why: '½ × 10 × 6 = 30.' },
    { text: '60 m²', ok: false, why: 'That’s the parallelogram: a triangle is half.' },
    { text: '16 m²', ok: false, why: 'That adds the lengths.' },
    { text: '32 m', ok: false, why: 'Area needs square units, and it isn’t a perimeter.' } ] },
  { emoji: '▱', title: 'Slanted plot', story: 'A parallelogram-shaped plot has base 8 m and perpendicular height 5 m (its slanted side is 6 m). What is its area?', idea: 'Parallelogram = base × perpendicular height', options: [
    { text: '40 m²', ok: true, why: '8 × 5 = 40. The slanted side is a distractor.' },
    { text: '48 m²', ok: false, why: 'Use the perpendicular height, not the slanted side.' },
    { text: '20 m²', ok: false, why: 'That halves it, like a triangle.' },
    { text: '240 m²', ok: false, why: 'Don’t multiply all three numbers.' } ] },
  { emoji: '🟫', title: 'Trapezium field', story: 'A field is a trapezium with parallel sides 6 m and 10 m, 4 m apart. What is its area?', idea: '½ × (a + b) × h', options: [
    { text: '32 m²', ok: true, why: '½ × 16 × 4 = 32.' },
    { text: '64 m²', ok: false, why: 'Remember the ½.' },
    { text: '240 m²', ok: false, why: 'Add the parallel sides; don’t multiply them.' },
    { text: '20 m²', ok: false, why: 'Check: ½ × (6 + 10) × 4.' } ] },
  { emoji: '🛞', title: 'Wheel', story: 'A wheel has a diameter of 14 cm. Using π = 22/7, how far does it roll in one turn?', idea: 'Circumference = πd', options: [
    { text: '44 cm', ok: true, why: '22/7 × 14 = 44.' },
    { text: '88 cm', ok: false, why: 'That uses 14 as the radius.' },
    { text: '154 cm', ok: false, why: 'That’s the area (in cm²).' },
    { text: '22 cm', ok: false, why: 'That’s half the circumference.' } ] },
  { emoji: '🍕', title: 'Pizza', story: 'A pizza has a radius of 7 cm. Using π = 22/7, what is its area?', idea: 'Area = πr²', options: [
    { text: '154 cm²', ok: true, why: '22/7 × 7 × 7 = 154.' },
    { text: '44 cm²', ok: false, why: 'That’s the circumference (in cm).' },
    { text: '616 cm²', ok: false, why: 'That uses 14 as the radius.' },
    { text: '49 cm²', ok: false, why: 'Don’t forget π.' } ] },
  { emoji: '🧊', title: 'Cube net', story: 'Which arrangement of 6 squares folds into a cube?', idea: 'Each square must become a different face', options: [
    { text: 'A row of 4 squares with one square above and one below the second square', ok: true, why: 'That’s the classic cross net.' },
    { text: 'A 2 × 3 rectangle', ok: false, why: 'Two squares would fold onto the same face.' },
    { text: 'A row of 6 squares', ok: false, why: 'It rolls round into a loop, overlapping.' },
    { text: 'A row of 4 with two squares above the first two', ok: false, why: 'The two flaps overlap on the same face.' } ] },
  { emoji: '💠', title: 'Euler', story: 'A solid has 5 faces and 6 vertices. How many edges does it have?', idea: 'F + V − E = 2', options: [
    { text: '9', ok: true, why: '5 + 6 − 2 = 9: a triangular prism.' },
    { text: '11', ok: false, why: '5 + 6 = 11, but you must subtract 2.' },
    { text: '13', ok: false, why: 'Rearrange F + V − E = 2 carefully.' },
    { text: '7', ok: false, why: 'Check: 5 + 6 − 7 = 4, not 2.' } ] },
  { emoji: '🎁', title: 'Gift box', story: 'A cube-shaped gift box has sides of 5 cm. How much wrapping paper covers it exactly?', idea: 'Surface area of a cube = 6a²', options: [
    { text: '150 cm²', ok: true, why: '6 × 25 = 150.' },
    { text: '125 cm²', ok: false, why: 'That’s the volume (in cm³).' },
    { text: '25 cm²', ok: false, why: 'That’s just one face.' },
    { text: '100 cm²', ok: false, why: 'A cube has 6 faces, not 4.' } ] },
  { emoji: '📦', title: 'Shoe box', story: 'A box is 10 cm long, 5 cm wide and 4 cm tall. What is its volume?', idea: 'l × b × h', options: [
    { text: '200 cm³', ok: true, why: '10 × 5 × 4 = 200.' },
    { text: '220 cm²', ok: false, why: 'That’s the surface area.' },
    { text: '19 cm³', ok: false, why: 'Multiply, don’t add.' },
    { text: '50 cm³', ok: false, why: 'That’s just the base area.' } ] },
  { emoji: '💧', title: 'Water tank', story: 'A tank is 1 m long, 50 cm wide and 40 cm deep. How many litres does it hold?', idea: '1 L = 1000 cm³', options: [
    { text: '200 L', ok: true, why: '100 × 50 × 40 = 2,00,000 cm³ = 200 L.' },
    { text: '2000 L', ok: false, why: 'Divide cm³ by 1000, not 100.' },
    { text: '2 L', ok: false, why: 'Convert 1 m to 100 cm first.' },
    { text: '20 L', ok: false, why: 'Check the conversion: 1000 cm³ = 1 L.' } ] },
]

export default function SpaceArchitect() {
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
      if (!useProgress.getState().badges.includes('space-architect')) addXp(25 + hearts * 10, 'Space Architect!')
      awardBadge('space-architect')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="space-architect" title="Boss Challenge: Space Architect" subtitle="Ten problems on area, circles, nets, surface area and volume." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏗️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Space Architect! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
