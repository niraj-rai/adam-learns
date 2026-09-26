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
  { emoji: '✂️', title: 'BPT', story: 'In △ABC, DE ∥ BC with AD = 2 cm, DB = 3 cm and AE = 4 cm. Find EC.', idea: 'AD/DB = AE/EC', options: [
    { text: '6 cm', ok: true, why: '2/3 = 4/EC.' },
    { text: '8 cm', ok: false, why: 'That uses AD/AE the wrong way.' },
    { text: '5 cm', ok: false, why: 'Subtracting doesn’t work.' },
    { text: '1.5 cm', ok: false, why: 'Ratio is upside down.' },
  ] },
  { emoji: '🌲', title: 'Shadow', story: 'A 1.5 m girl casts a 2 m shadow; at the same time a tree casts a 24 m shadow. How tall is the tree?', idea: 'Similar triangles from the Sun’s rays', options: [
    { text: '18 m', ok: true, why: '1.5/2 = h/24.' },
    { text: '32 m', ok: false, why: 'Ratio upside down.' },
    { text: '36 m', ok: false, why: 'Check: 1.5 × 24 = 36, then ÷ 2.' },
    { text: '23.5 m', ok: false, why: 'Subtracting doesn’t work.' },
  ] },
  { emoji: '🟥', title: 'Area ratio', story: 'Two similar triangles have sides in the ratio 3 : 5. What is the ratio of their areas?', idea: 'Areas scale by k²', options: [
    { text: '9 : 25', ok: true, why: '3² : 5².' },
    { text: '3 : 5', ok: false, why: 'That is the side ratio.' },
    { text: '6 : 10', ok: false, why: 'Double, not square.' },
    { text: '27 : 125', ok: false, why: 'That is for volumes.' },
  ] },
  { emoji: '🔺', title: 'Which test?', story: 'Two triangles have angles 50°, 60°, 70° and 70°, 50°, 60°. Are they similar?', idea: 'AA similarity', options: [
    { text: 'Yes, by AA', ok: true, why: 'Two pairs of equal angles are enough.' },
    { text: 'No, the angles are in a different order', ok: false, why: 'Order doesn’t matter; match them.' },
    { text: 'Only if the sides are equal', ok: false, why: 'Equal sides would be congruence.' },
    { text: 'Yes, by SSS', ok: false, why: 'No sides were given.' },
  ] },
  { emoji: '📏', title: 'Pythagoras check', story: 'Is a triangle with sides 7, 24 and 25 right-angled?', idea: '7² + 24² = ?', options: [
    { text: 'Yes', ok: true, why: '49 + 576 = 625 = 25².' },
    { text: 'No', ok: false, why: 'Check the squares.' },
    { text: 'Only if it is isosceles', ok: false, why: 'It isn’t isosceles.' },
    { text: 'Cannot tell', ok: false, why: 'The converse of Pythagoras tells us.' },
  ] },
  { emoji: '📍', title: 'Midpoint', story: 'What is the midpoint of (−4, 6) and (8, −2)?', idea: 'Average the coordinates', options: [
    { text: '(2, 2)', ok: true, why: '((−4 + 8)/2, (6 − 2)/2).' },
    { text: '(6, 4)', ok: false, why: 'That subtracts.' },
    { text: '(4, 4)', ok: false, why: 'Divide by 2.' },
    { text: '(2, 4)', ok: false, why: 'Check y: (6 − 2)/2 = 2.' },
  ] },
  { emoji: '✂️', title: 'Section', story: 'Find the point dividing (2, 3) and (8, 9) in the ratio 1 : 2.', idea: '((m x₂ + n x₁)/(m + n), …)', options: [
    { text: '(4, 5)', ok: true, why: '((8 + 4)/3, (9 + 6)/3).' },
    { text: '(6, 7)', ok: false, why: 'That is ratio 2 : 1.' },
    { text: '(5, 6)', ok: false, why: 'That is the midpoint.' },
    { text: '(3, 4)', ok: false, why: 'Check with the formula.' },
  ] },
  { emoji: '↔️', title: 'Distance', story: 'What is the distance between (1, 2) and (4, 6)?', idea: '√(Δx² + Δy²)', options: [
    { text: '5', ok: true, why: '√(9 + 16).' },
    { text: '7', ok: false, why: 'Adding Δx and Δy isn’t the distance.' },
    { text: '√7', ok: false, why: 'Square the differences first.' },
    { text: '25', ok: false, why: 'Take the square root.' },
  ] },
  { emoji: '📐', title: 'Collinear?', story: 'Are (1, 1), (2, 3) and (3, 5) collinear?', idea: 'Area of triangle = 0?', options: [
    { text: 'Yes', ok: true, why: 'Slopes are both 2; area = 0.' },
    { text: 'No', ok: false, why: 'Check the slopes.' },
    { text: 'Only two of them', ok: false, why: 'All three lie on y = 2x − 1.' },
    { text: 'Cannot tell', ok: false, why: 'The area formula tells us.' },
  ] },
  { emoji: '🟦', title: 'Trisection', story: 'P and Q trisect the segment from (0, 0) to (9, 6). Which is P, nearer to (0, 0)?', idea: 'Ratio 1 : 2', options: [
    { text: '(3, 2)', ok: true, why: 'One third of the way.' },
    { text: '(6, 4)', ok: false, why: 'That is Q, ratio 2 : 1.' },
    { text: '(4.5, 3)', ok: false, why: 'That is the midpoint.' },
    { text: '(3, 3)', ok: false, why: 'y should be 6/3 = 2.' },
  ] },
]

export default function SimilarityMaster() {
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
      if (!useProgress.getState().badges.includes('similarity-master')) addXp(25 + hearts * 10, 'Similarity and Coordinates Master!')
      awardBadge('similarity-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="similarity-master" title="Boss Challenge: Similarity and Coordinates Master" subtitle="Ten problems on similar triangles, the section formula and coordinates." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">📐</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Similarity and Coordinates Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
