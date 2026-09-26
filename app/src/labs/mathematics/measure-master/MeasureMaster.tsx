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
  { emoji: '⊥', title: 'Tangent and radius', story: 'What angle does a tangent make with the radius at the point of contact?', idea: 'A key theorem', options: [
    { text: '90°', ok: true, why: 'The tangent is perpendicular to the radius.' },
    { text: '45°', ok: false, why: 'It is a right angle.' },
    { text: '180°', ok: false, why: 'That would be a straight line.' },
    { text: 'It depends on the circle', ok: false, why: 'Always 90°.' },
  ] },
  { emoji: '📏', title: 'Tangent length', story: 'From a point 13 cm from the centre, tangents are drawn to a circle of radius 5 cm. How long is each tangent?', idea: '√(OP² − r²)', options: [
    { text: '12 cm', ok: true, why: '√(169 − 25).' },
    { text: '8 cm', ok: false, why: 'Subtract squares, not lengths.' },
    { text: '18 cm', ok: false, why: 'Don’t add.' },
    { text: '√194 cm', ok: false, why: 'Subtract, not add, the squares.' },
  ] },
  { emoji: '🔁', title: 'Two tangents', story: 'Tangents PA and PB are drawn from P to a circle with centre O. If ∠APB = 70°, find ∠AOB.', idea: 'OAPB has two right angles', options: [
    { text: '110°', ok: true, why: '360 − 90 − 90 − 70.' },
    { text: '70°', ok: false, why: 'They add to 180°.' },
    { text: '140°', ok: false, why: 'That doubles 70°.' },
    { text: '20°', ok: false, why: '90 − 70 isn’t right here.' },
  ] },
  { emoji: '🍕', title: 'Sector', story: 'Find the area of a sector of radius 14 cm and angle 90° (π = 22/7).', idea: '(θ/360) × πr²', options: [
    { text: '154 cm²', ok: true, why: '¼ × 616.' },
    { text: '616 cm²', ok: false, why: 'That is the whole circle.' },
    { text: '22 cm²', ok: false, why: 'That is the arc length.' },
    { text: '308 cm²', ok: false, why: 'That is a semicircle.' },
  ] },
  { emoji: '🌙', title: 'Segment', story: 'A chord subtends 90° at the centre of a circle of radius 14 cm. Find the area of the minor segment (π = 22/7).', idea: 'Sector − triangle', options: [
    { text: '56 cm²', ok: true, why: '154 − ½ × 14 × 14 = 154 − 98.' },
    { text: '154 cm²', ok: false, why: 'Subtract the triangle.' },
    { text: '98 cm²', ok: false, why: 'That is the triangle.' },
    { text: '252 cm²', ok: false, why: 'Subtract, don’t add.' },
  ] },
  { emoji: '🍦', title: 'Ice cream', story: 'A cone of radius 3 cm and height 4 cm is topped by a hemisphere of radius 3 cm. What is its volume, in terms of π?', idea: '⅓πr²h + ⅔πr³', options: [
    { text: '30π cm³', ok: true, why: '12π + 18π.' },
    { text: '12π cm³', ok: false, why: 'That is just the cone.' },
    { text: '18π cm³', ok: false, why: 'That is just the hemisphere.' },
    { text: '48π cm³', ok: false, why: 'That uses a whole sphere instead of a hemisphere.' },
  ] },
  { emoji: '💊', title: 'Capsule surface', story: 'A capsule is a cylinder (r = 2, h = 10) with hemispheres on both ends. What is its outer surface area, in terms of π?', idea: '2πrh + 4πr²', options: [
    { text: '56π', ok: true, why: '40π + 16π.' },
    { text: '40π', ok: false, why: 'Add the two hemispheres.' },
    { text: '64π', ok: false, why: 'Don’t count the joined faces.' },
    { text: '48π', ok: false, why: 'Check: 4πr² = 16π.' },
  ] },
  { emoji: '⚽', title: 'Recast', story: 'A metal sphere of radius 6 cm is melted into small spheres of radius 2 cm. How many?', idea: 'Volume is conserved: (R/r)³', options: [
    { text: '27', ok: true, why: '(6/2)³ = 27.' },
    { text: '3', ok: false, why: 'Cube the ratio.' },
    { text: '9', ok: false, why: 'Volume uses the cube, not the square.' },
    { text: '36', ok: false, why: 'Check: 3³ = 27.' },
  ] },
  { emoji: '🥤', title: 'Pour it', story: 'Water from a cylinder (r = 4, h = 9) is poured into a cone (r = 4). How tall must the cone be to hold it all?', idea: 'Cone holds ⅓ of a cylinder of the same base and height', options: [
    { text: '27', ok: true, why: 'πr²·9 = ⅓πr²·h → h = 27.' },
    { text: '9', ok: false, why: 'A cone of height 9 holds only a third.' },
    { text: '3', ok: false, why: 'The cone must be taller, not shorter.' },
    { text: '18', ok: false, why: 'It needs three times the height.' },
  ] },
  { emoji: '⛺', title: 'Tent canvas', story: 'Which parts of a tent (cylinder + cone) need canvas?', idea: 'Only the outer curved surfaces', options: [
    { text: 'Curved surface of the cylinder and of the cone', ok: true, why: 'The floor and the joined circle don’t need canvas.' },
    { text: 'The whole surface of both solids', ok: false, why: 'Joined and floor faces are hidden.' },
    { text: 'Only the cone', ok: false, why: 'The walls need canvas too.' },
    { text: 'The floor and the cone', ok: false, why: 'The floor usually isn’t canvas.' },
  ] },
]

export default function MeasureMaster() {
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
      if (!useProgress.getState().badges.includes('measure-master')) addXp(25 + hearts * 10, 'Circles and Solids Master!')
      awardBadge('measure-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="measure-master" title="Boss Challenge: Circles and Solids Master" subtitle="Ten problems on tangents, areas of segments and combined solids." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🍦</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Circles and Solids Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
