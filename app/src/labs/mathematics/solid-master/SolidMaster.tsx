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
  { emoji: '🔺', title: "Heron's formula", story: 'Find the area of a triangle with sides 5, 12 and 13 cm.', idea: 's = 15; area = √[s(s−a)(s−b)(s−c)]', options: [
    { text: '30 cm²', ok: true, why: '√(15 × 10 × 3 × 2) = √900 = 30.' },
    { text: '60 cm²', ok: false, why: 'That’s base × height without the ½.' },
    { text: '15 cm²', ok: false, why: 'That’s s, not the area.' },
    { text: '90 cm²', ok: false, why: 'Take the square root of 900.' },
  ] },
  { emoji: '🧮', title: 'Semi-perimeter', story: 'What is the semi-perimeter of a triangle with sides 7, 8 and 9 cm?', idea: 's = (a + b + c) ÷ 2', options: [
    { text: '12 cm', ok: true, why: '24 ÷ 2 = 12.' },
    { text: '24 cm', ok: false, why: 'That’s the full perimeter.' },
    { text: '8 cm', ok: false, why: 'That’s just one side.' },
    { text: '6 cm', ok: false, why: 'Divide by 2, not 4.' },
  ] },
  { emoji: '🍕', title: 'Sector area', story: 'Find the area of a sector with radius 14 cm and angle 90°. (π = 22/7)', idea: 'θ/360 × πr²', options: [
    { text: '154 cm²', ok: true, why: '¼ × 22/7 × 196 = 154.' },
    { text: '616 cm²', ok: false, why: 'That’s the whole circle.' },
    { text: '22 cm²', ok: false, why: 'That’s the arc length.' },
    { text: '308 cm²', ok: false, why: 'That would be a semicircle.' },
  ] },
  { emoji: '〰️', title: 'Arc length', story: 'Find the length of the arc of a 60° sector of radius 21 cm. (π = 22/7)', idea: 'θ/360 × 2πr', options: [
    { text: '22 cm', ok: true, why: '⅙ × 2 × 22/7 × 21 = 22.' },
    { text: '132 cm', ok: false, why: 'That’s the whole circumference.' },
    { text: '231 cm', ok: false, why: 'That’s the sector area.' },
    { text: '11 cm', ok: false, why: 'Use 2πr, not πr.' },
  ] },
  { emoji: '🍦', title: 'Slant height', story: 'A cone has radius 6 cm and height 8 cm. What is its slant height?', idea: 'l = √(r² + h²)', options: [
    { text: '10 cm', ok: true, why: '√(36 + 64) = 10.' },
    { text: '14 cm', ok: false, why: 'Use Pythagoras, not addition.' },
    { text: '√28 cm', ok: false, why: 'Add the squares.' },
    { text: '48 cm', ok: false, why: 'That’s r × h.' },
  ] },
  { emoji: '📦', title: 'Cone volume', story: 'A cone and a cylinder have the same radius and height. The cylinder holds 300 mL. How much does the cone hold?', idea: 'Cone = ⅓ of the cylinder', options: [
    { text: '100 mL', ok: true, why: '300 ÷ 3 = 100 mL.' },
    { text: '150 mL', ok: false, why: 'That would be half.' },
    { text: '300 mL', ok: false, why: 'A cone holds less.' },
    { text: '900 mL', ok: false, why: 'It’s a third, not three times.' },
  ] },
  { emoji: '⚽', title: 'Sphere surface', story: 'Find the surface area of a ball of radius 7 cm. (π = 22/7)', idea: '4πr²', options: [
    { text: '616 cm²', ok: true, why: '4 × 22/7 × 49 = 616.' },
    { text: '154 cm²', ok: false, why: 'That’s πr², the area of one circle.' },
    { text: '1437 cm³', ok: false, why: 'That’s the volume (and in cm³).' },
    { text: '88 cm²', ok: false, why: 'That’s 4πr.' },
  ] },
  { emoji: '🥣', title: 'Hemisphere', story: 'What is the total surface area of a solid hemisphere of radius r?', idea: 'Curved 2πr² + flat πr²', options: [
    { text: '3πr²', ok: true, why: 'The curved half-sphere plus the circular base.' },
    { text: '2πr²', ok: false, why: 'That’s only the curved part.' },
    { text: '4πr²', ok: false, why: 'That’s a whole sphere.' },
    { text: '⅔πr³', ok: false, why: 'That’s a volume.' },
  ] },
  { emoji: '🌍', title: 'Sphere volume', story: 'The radius of a sphere is doubled. Its volume becomes…', idea: 'V ∝ r³', options: [
    { text: '8 times bigger', ok: true, why: '2³ = 8.' },
    { text: '2 times bigger', ok: false, why: 'Volume depends on r³.' },
    { text: '4 times bigger', ok: false, why: 'That’s what happens to surface area.' },
    { text: '6 times bigger', ok: false, why: '2 × 3 isn’t the rule; cube it.' },
  ] },
  { emoji: '🏺', title: 'Archimedes', story: 'A sphere fits exactly inside a cylinder. What fraction of the cylinder’s volume is the sphere?', idea: 'Cone : sphere : cylinder = 1 : 2 : 3', options: [
    { text: '2/3', ok: true, why: 'The sphere is two-thirds of the cylinder.' },
    { text: '1/3', ok: false, why: 'That’s the cone.' },
    { text: '1/2', ok: false, why: 'Close, but it’s 2/3.' },
    { text: '3/4', ok: false, why: 'It’s exactly 2/3.' },
  ] },
]

export default function SolidMaster() {
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
      if (!useProgress.getState().badges.includes('solid-master')) addXp(25 + hearts * 10, 'Solid Master!')
      awardBadge('solid-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="solid-master" title="Boss Challenge: Solid Master" subtitle="Ten problems on Heron's formula, sectors, cones and spheres." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏺</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Solid Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
