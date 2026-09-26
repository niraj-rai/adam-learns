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
  { emoji: '🛤️', title: 'Railway lines', story: 'Two parallel railway tracks are crossed by a road. One interior angle is 65°. What is the alternate interior angle?', idea: 'Alternate interior angles are equal', options: [
    { text: '65°', ok: true, why: 'With parallel lines, alternate interior angles are equal.' },
    { text: '115°', ok: false, why: 'That’s the co-interior angle (they add to 180°).' },
    { text: '25°', ok: false, why: 'That would make them complementary, which isn’t a rule here.' },
    { text: '130°', ok: false, why: 'Doubling doesn’t apply.' } ] },
  { emoji: '🪜', title: 'Ladder rungs', story: 'On a ladder, the rails are parallel. A rung makes a co-interior angle of 110° with one rail. What is the other co-interior angle?', idea: 'Co-interior angles add to 180°', options: [
    { text: '70°', ok: true, why: '180° − 110° = 70°.' },
    { text: '110°', ok: false, why: 'Co-interior angles add to 180°; they aren’t equal.' },
    { text: '250°', ok: false, why: 'That’s 360° − 110°.' },
    { text: '90°', ok: false, why: 'Only if the rung were perpendicular.' } ] },
  { emoji: '🔺', title: 'Missing angle', story: 'Two angles of a triangle are 50° and 60°. What is the third?', idea: 'Angles in a triangle add to 180°', options: [
    { text: '70°', ok: true, why: '180 − 50 − 60 = 70.' },
    { text: '110°', ok: false, why: 'That’s 50 + 60, the exterior angle.' },
    { text: '250°', ok: false, why: 'That uses 360°: that’s for quadrilaterals.' },
    { text: '80°', ok: false, why: 'Check the subtraction.' } ] },
  { emoji: '↗️', title: 'Exterior angle', story: 'The two interior opposite angles of a triangle are 40° and 75°. What is the exterior angle?', idea: 'Exterior angle = sum of the two interior opposite angles', options: [
    { text: '115°', ok: true, why: '40 + 75 = 115.' },
    { text: '65°', ok: false, why: 'That’s the third interior angle.' },
    { text: '35°', ok: false, why: 'That subtracts instead of adding.' },
    { text: '245°', ok: false, why: 'Too big: exterior angles of a triangle are less than 180°.' } ] },
  { emoji: '📏', title: 'Three sticks', story: 'Can sticks of 3 cm, 4 cm and 8 cm make a triangle?', idea: 'Triangle inequality', options: [
    { text: 'No, because 3 + 4 is less than 8', ok: true, why: 'The two short sticks can’t reach each other.' },
    { text: 'Yes, any three sticks can', ok: false, why: 'Try it: 3 + 4 = 7 is less than 8.' },
    { text: 'Yes, because 8 is the longest', ok: false, why: 'The longest side must be shorter than the other two together.' },
    { text: 'Only if it is right-angled', ok: false, why: '3² + 4² = 25, not 64.' } ] },
  { emoji: '👯', title: 'Twins?', story: 'Which information does NOT guarantee that two triangles are congruent?', idea: 'AAA fixes the shape but not the size', options: [
    { text: 'All three angles equal (AAA)', ok: true, why: 'A small and a large triangle can have the same angles.' },
    { text: 'All three sides equal (SSS)', ok: false, why: 'SSS always works.' },
    { text: 'Two sides and the included angle (SAS)', ok: false, why: 'SAS always works.' },
    { text: 'Right angle, hypotenuse and a side (RHS)', ok: false, why: 'RHS always works.' } ] },
  { emoji: '🔷', title: 'Rhombus', story: 'Which property does every rhombus have?', idea: 'A rhombus is a parallelogram with all sides equal', options: [
    { text: 'All four sides equal', ok: true, why: 'That’s the definition of a rhombus.' },
    { text: 'All angles 90°', ok: false, why: 'That’s only true for a square.' },
    { text: 'Equal diagonals', ok: false, why: 'Only a square (or rectangle) has equal diagonals.' },
    { text: 'Only one pair of parallel sides', ok: false, why: 'A rhombus has two pairs.' } ] },
  { emoji: '📐', title: 'Hypotenuse', story: 'A right-angled triangle has shorter sides 6 cm and 8 cm. How long is the hypotenuse?', idea: 'c² = a² + b²', options: [
    { text: '10 cm', ok: true, why: '36 + 64 = 100, √100 = 10.' },
    { text: '14 cm', ok: false, why: 'Adding the sides doesn’t work.' },
    { text: '48 cm', ok: false, why: 'Multiplying doesn’t work.' },
    { text: '√28 cm', ok: false, why: 'That subtracts the squares: use subtraction only for a shorter side.' } ] },
  { emoji: '🪜', title: 'Ladder', story: 'A 13 m ladder leans against a wall with its foot 5 m from the wall. How high up the wall does it reach?', idea: 'The ladder is the hypotenuse: h² = 13² − 5²', options: [
    { text: '12 m', ok: true, why: '169 − 25 = 144, √144 = 12.' },
    { text: '8 m', ok: false, why: '13 − 5 = 8: subtract the squares, not the lengths.' },
    { text: '√194 m', ok: false, why: 'That adds the squares: the ladder is the longest side.' },
    { text: '18 m', ok: false, why: 'The height must be less than the ladder.' } ] },
  { emoji: '🐝', title: 'Tiling', story: 'Which regular polygon can NOT tile a floor on its own?', idea: 'Each angle must divide 360° exactly', options: [
    { text: 'Pentagon', ok: true, why: 'Its angle is 108°, and 360 ÷ 108 isn’t a whole number.' },
    { text: 'Hexagon', ok: false, why: '120° × 3 = 360°: hexagons tile (just ask a bee).' },
    { text: 'Square', ok: false, why: '90° × 4 = 360°.' },
    { text: 'Equilateral triangle', ok: false, why: '60° × 6 = 360°.' } ] },
]

export default function GeometryGuardian() {
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
      if (!useProgress.getState().badges.includes('geometry-guardian')) addXp(25 + hearts * 10, 'Geometry Guardian!')
      awardBadge('geometry-guardian')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="geometry-guardian" title="Boss Challenge: Geometry Guardian" subtitle="Ten problems on angles, triangles, quadrilaterals, Pythagoras and tiling." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🛡️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Geometry Guardian! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
