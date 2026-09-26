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
  { emoji: '🔦', title: 'Beam test', story: 'A torch beam is clearly visible through a glass of diluted milk, but the milk doesn’t settle and passes through filter paper. What is it?', idea: 'Colloids scatter light but don’t settle or filter out', options: [
    { text: 'A colloid', ok: true, why: 'Medium-sized particles scatter light (Tyndall effect) but stay spread out.' },
    { text: 'A true solution', ok: false, why: 'Solutions don’t scatter a beam.' },
    { text: 'A suspension', ok: false, why: 'A suspension would settle and leave a residue on filter paper.' },
    { text: 'A pure substance', ok: false, why: 'Milk is a mixture of water, fats and proteins.' } ] },
  { emoji: '🟤', title: 'Muddy river', story: 'River water left in a jar goes clear at the top with a layer of mud at the bottom. What kind of mixture was it?', idea: 'Suspensions settle on standing', options: [
    { text: 'A suspension', ok: true, why: 'The large soil particles are pulled down by gravity.' },
    { text: 'A colloid', ok: false, why: 'Colloid particles are too small to settle.' },
    { text: 'A solution', ok: false, why: 'A solution never separates on standing.' },
    { text: 'An element', ok: false, why: 'River water is a mixture.' } ] },
  { emoji: '🍬', title: 'Sugar syrup', story: '25 g of sugar is dissolved in 100 g of water. What is the concentration by mass?', idea: 'Divide by the mass of the SOLUTION', options: [
    { text: '20%', ok: true, why: '25 ÷ (25 + 100) × 100 = 20%.' },
    { text: '25%', ok: false, why: 'Divide by the solution (125 g), not the solvent.' },
    { text: '4%', ok: false, why: 'That’s upside down.' },
    { text: '125%', ok: false, why: 'A percentage by mass can’t be over 100%.' } ] },
  { emoji: '🧴', title: 'Sanitiser', story: 'A 200 mL bottle of hand sanitiser contains 140 mL of alcohol. What is its concentration?', idea: '% v/v = volume of solute ÷ volume of solution × 100', options: [
    { text: '70% (v/v)', ok: true, why: '140 ÷ 200 × 100 = 70%.' },
    { text: '140% (v/v)', ok: false, why: 'Divide by the total volume.' },
    { text: '30% (v/v)', ok: false, why: 'That’s the percentage of the other ingredients.' },
    { text: '1.4% (v/v)', ok: false, why: 'Multiply by 100, not divide.' } ] },
  { emoji: '💉', title: 'Saline drip', story: 'How much salt is in 500 mL of 0.9% (m/v) saline?', idea: '% m/v = grams of solute per 100 mL of solution', options: [
    { text: '4.5 g', ok: true, why: '0.9 g per 100 mL, so 0.9 × 5 = 4.5 g.' },
    { text: '0.9 g', ok: false, why: 'That’s per 100 mL; there are 500 mL.' },
    { text: '45 g', ok: false, why: 'Check the decimal point.' },
    { text: '450 g', ok: false, why: 'That would be far too salty!' } ] },
  { emoji: '🌡️', title: 'Saturated', story: 'At 20 °C, 36 g of salt dissolves in 100 g of water. You add 50 g of salt to 100 g of water at 20 °C. What happens?', idea: 'A saturated solution can’t dissolve more', options: [
    { text: '36 g dissolves; 14 g stays undissolved', ok: true, why: 'The solution is saturated once 36 g has dissolved.' },
    { text: 'All 50 g dissolves', ok: false, why: 'It can only hold 36 g at 20 °C.' },
    { text: 'None of it dissolves', ok: false, why: 'Up to 36 g dissolves.' },
    { text: 'The water turns into salt', ok: false, why: 'The solvent is still water.' } ] },
  { emoji: '❄️', title: 'Crystals', story: 'A hot saturated solution of potassium nitrate is cooled. What do you observe?', idea: 'Solubility of most solids falls as temperature falls', options: [
    { text: 'Crystals form', ok: true, why: 'Less solute can stay dissolved when it’s colder: crystallisation.' },
    { text: 'It boils', ok: false, why: 'Cooling doesn’t make it boil.' },
    { text: 'Nothing happens', ok: false, why: 'Potassium nitrate’s solubility drops a lot on cooling.' },
    { text: 'It becomes a colloid', ok: false, why: 'Solid crystals separate out instead.' } ] },
  { emoji: '🌤️', title: 'Sunbeams', story: 'Sunlight makes visible beams through a forest canopy on a misty morning. Why?', idea: 'The Tyndall effect: particles scatter light', options: [
    { text: 'Tiny water droplets in the air scatter the light', ok: true, why: 'Mist is a colloid of water in air.' },
    { text: 'The trees give off light', ok: false, why: 'Trees don’t glow.' },
    { text: 'Light bends round the leaves', ok: false, why: 'The beams are visible because of scattering by particles.' },
    { text: 'The air is a true solution', ok: false, why: 'A solution would not scatter the light.' } ] },
  { emoji: '🧂', title: 'Particle sizes', story: 'Which list puts the particle sizes in order from smallest to largest?', idea: 'Solution < colloid < suspension', options: [
    { text: 'Solution, colloid, suspension', ok: true, why: 'Below 1 nm, 1–1000 nm, above 1000 nm.' },
    { text: 'Colloid, solution, suspension', ok: false, why: 'Solutions have the smallest particles.' },
    { text: 'Suspension, colloid, solution', ok: false, why: 'That’s largest to smallest.' },
    { text: 'All the same size', ok: false, why: 'Particle size is what makes them different.' } ] },
  { emoji: '📈', title: 'Solubility curve', story: 'On a solubility curve, salt’s line is almost flat while potassium nitrate’s rises steeply. What does this mean?', idea: 'The slope shows how solubility changes with temperature', options: [
    { text: 'Heating changes KNO₃’s solubility much more than salt’s', ok: true, why: 'A steep curve means solubility rises quickly with temperature.' },
    { text: 'Salt doesn’t dissolve in water', ok: false, why: 'About 36 g of salt dissolves per 100 g water.' },
    { text: 'KNO₃ dissolves less when hot', ok: false, why: 'Its curve rises, so it dissolves more when hot.' },
    { text: 'Both change equally', ok: false, why: 'The slopes are very different.' } ] },
]

export default function MixtureMaster() {
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
      if (!useProgress.getState().badges.includes('mixture-master')) addXp(25 + hearts * 10, 'Mixture Master!')
      awardBadge('mixture-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="mixture-master" title="Boss Challenge: Mixture Master" subtitle="Ten problems on solutions, colloids, suspensions, concentration and solubility." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🥛</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Mixture Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Chemistry idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
