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
  { emoji: '📜', title: 'Axiom or theorem?', story: 'Which of these is one of Euclid’s axioms (common notions)?', idea: 'Axioms are accepted without proof', options: [
    { text: 'Things equal to the same thing are equal to each other', ok: true, why: 'Euclid’s first common notion.' },
    { text: 'The angles of a triangle add to 180°', ok: false, why: 'That’s a theorem, proved from the postulates.' },
    { text: 'Base angles of an isosceles triangle are equal', ok: false, why: 'That’s a theorem.' },
    { text: 'The midpoint theorem', ok: false, why: 'That’s a theorem.' },
  ] },
  { emoji: '✖️', title: 'Vertically opposite', story: 'Two lines cross. One angle is 70°. What is the angle vertically opposite it?', idea: 'Vertically opposite angles are equal', options: [
    { text: '70°', ok: true, why: 'Vertically opposite angles are equal.' },
    { text: '110°', ok: false, why: 'That’s the angle next to it (a linear pair).' },
    { text: '20°', ok: false, why: '90° − 70° is a complement; not relevant here.' },
    { text: '290°', ok: false, why: 'Angles at a point add to 360°, but that’s not the question.' },
  ] },
  { emoji: '🔺', title: 'Isosceles', story: 'In △PQR, PQ = PR and ∠Q = 65°. Find ∠P.', idea: 'Base angles are equal; angle sum is 180°', options: [
    { text: '50°', ok: true, why: '∠R = 65°, so ∠P = 180 − 130 = 50°.' },
    { text: '65°', ok: false, why: 'That’s ∠R.' },
    { text: '115°', ok: false, why: '180 − 65 uses only one base angle.' },
    { text: '25°', ok: false, why: 'Check: 65 + 65 + 25 = 155.' },
  ] },
  { emoji: '🧩', title: 'Congruence rule', story: 'Two triangles have two sides and the angle BETWEEN them equal. Which rule proves them congruent?', idea: 'SAS: the angle must be included', options: [
    { text: 'SAS', ok: true, why: 'Side–Angle–Side with the included angle.' },
    { text: 'SSA', ok: false, why: 'SSA is not a valid congruence rule.' },
    { text: 'AAA', ok: false, why: 'AAA gives similar, not necessarily congruent, triangles.' },
    { text: 'RHS', ok: false, why: 'RHS needs a right angle and the hypotenuse.' },
  ] },
  { emoji: '▱', title: 'Parallelogram', story: 'In parallelogram ABCD, ∠A = 110°. Find ∠B.', idea: 'Adjacent angles of a parallelogram add to 180°', options: [
    { text: '70°', ok: true, why: '180 − 110 = 70°.' },
    { text: '110°', ok: false, why: 'That’s ∠C, the opposite angle.' },
    { text: '250°', ok: false, why: 'Adjacent angles add to 180°.' },
    { text: '90°', ok: false, why: 'Only rectangles have 90° angles.' },
  ] },
  { emoji: '✂️', title: 'Midpoint theorem', story: 'M and N are the midpoints of AB and AC in △ABC. BC = 14 cm. Find MN.', idea: 'MN ∥ BC and MN = ½ BC', options: [
    { text: '7 cm', ok: true, why: 'Half of 14 cm.' },
    { text: '14 cm', ok: false, why: 'MN is half of BC.' },
    { text: '28 cm', ok: false, why: 'MN is shorter than BC.' },
    { text: '3.5 cm', ok: false, why: 'That’s a quarter.' },
  ] },
  { emoji: '⭕', title: 'Angle at the centre', story: 'An arc makes an angle of 50° at a point on the circle. What angle does it make at the centre?', idea: 'Angle at centre = 2 × angle at circumference', options: [
    { text: '100°', ok: true, why: '2 × 50° = 100°.' },
    { text: '25°', ok: false, why: 'The centre angle is double, not half.' },
    { text: '50°', ok: false, why: 'The centre angle is bigger.' },
    { text: '130°', ok: false, why: 'That’s 180° − 50°.' },
  ] },
  { emoji: '🔲', title: 'Cyclic quadrilateral', story: 'In a cyclic quadrilateral one angle is 85°. What is the opposite angle?', idea: 'Opposite angles add to 180°', options: [
    { text: '95°', ok: true, why: '180 − 85 = 95°.' },
    { text: '85°', ok: false, why: 'Opposite angles are supplementary, not equal.' },
    { text: '275°', ok: false, why: 'They add to 180°, not 360°.' },
    { text: '5°', ok: false, why: '90 − 85 isn’t the rule.' },
  ] },
  { emoji: '🌓', title: 'Semicircle', story: 'AB is a diameter and C is on the circle. What is ∠ACB?', idea: 'The angle in a semicircle is a right angle', options: [
    { text: '90°', ok: true, why: 'The diameter makes 180° at the centre, so 90° at the circumference.' },
    { text: '180°', ok: false, why: 'That’s the angle at the centre.' },
    { text: '60°', ok: false, why: 'Only if the triangle were equilateral, which it can’t be.' },
    { text: '45°', ok: false, why: 'Not in general.' },
  ] },
  { emoji: '📏', title: 'Chords', story: 'A chord of length 16 cm is 6 cm from the centre of a circle. What is the radius?', idea: 'The perpendicular from the centre bisects the chord', options: [
    { text: '10 cm', ok: true, why: 'Half chord = 8; √(8² + 6²) = 10.' },
    { text: '8 cm', ok: false, why: 'That’s half the chord.' },
    { text: '√(16² + 6²) ≈ 17.1 cm', ok: false, why: 'Use HALF the chord.' },
    { text: '22 cm', ok: false, why: 'Use Pythagoras, not addition.' },
  ] },
]

export default function ProofMaster() {
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
      if (!useProgress.getState().badges.includes('proof-master')) addXp(25 + hearts * 10, 'Proof Master!')
      awardBadge('proof-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="proof-master" title="Boss Challenge: Proof Master" subtitle="Ten problems on Euclid, angles, congruence, quadrilaterals and circles." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">📐</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Proof Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
