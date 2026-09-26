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
  { emoji: '🔋', title: "Ohm's law", story: 'A 12 V battery drives a current through a 4 Ω resistor. What is the current?', idea: 'I = V/R', options: [
    { text: '3 A', ok: true, why: '12 ÷ 4 = 3 A.' },
    { text: '48 A', ok: false, why: 'Divide, don’t multiply.' },
    { text: '0.33 A', ok: false, why: 'That’s R/V.' },
    { text: '16 A', ok: false, why: 'Add? No: divide.' },
  ] },
  { emoji: '➕', title: 'Series', story: 'Resistors of 3 Ω, 5 Ω and 2 Ω are joined in series. What is the total resistance?', idea: 'R = R₁ + R₂ + R₃', options: [
    { text: '10 Ω', ok: true, why: '3 + 5 + 2 = 10.' },
    { text: '0.97 Ω', ok: false, why: 'That’s the parallel result.' },
    { text: '30 Ω', ok: false, why: 'Add, don’t multiply.' },
    { text: '5 Ω', ok: false, why: 'Add all three.' },
  ] },
  { emoji: '🔀', title: 'Parallel', story: 'Two 6 Ω resistors are joined in parallel. What is the combined resistance?', idea: '1/R = 1/R₁ + 1/R₂', options: [
    { text: '3 Ω', ok: true, why: '1/6 + 1/6 = 1/3.' },
    { text: '12 Ω', ok: false, why: 'That’s series.' },
    { text: '6 Ω', ok: false, why: 'Parallel is less than either one.' },
    { text: '36 Ω', ok: false, why: 'Not a product.' },
  ] },
  { emoji: '🏠', title: 'House wiring', story: 'Why are household appliances connected in parallel?', idea: 'Each branch gets the full supply voltage', options: [
    { text: 'Each gets 230 V and can be switched on and off independently', ok: true, why: 'In series they would share the voltage and all go off together.' },
    { text: 'To use less electricity', ok: false, why: 'Parallel doesn’t reduce energy use.' },
    { text: 'To make the current smaller', ok: false, why: 'Total current is actually larger.' },
    { text: 'Because it needs less wire', ok: false, why: 'That’s not the reason.' },
  ] },
  { emoji: '💡', title: 'Power', story: 'A 230 V bulb draws 0.5 A. What is its power?', idea: 'P = VI', options: [
    { text: '115 W', ok: true, why: '230 × 0.5 = 115 W.' },
    { text: '460 W', ok: false, why: 'Multiply by 0.5, not divide.' },
    { text: '230.5 W', ok: false, why: 'Multiply, don’t add.' },
    { text: '0.002 W', ok: false, why: 'That’s I/V.' },
  ] },
  { emoji: '🔥', title: 'Heating effect', story: 'The current through a heater is doubled. What happens to the heat produced per second?', idea: 'H = I²Rt', options: [
    { text: 'It becomes four times as much', ok: true, why: '(2I)² = 4I².' },
    { text: 'It doubles', ok: false, why: 'Heat depends on I squared.' },
    { text: 'It halves', ok: false, why: 'More current, more heat.' },
    { text: 'It stays the same', ok: false, why: 'Heat depends on current.' },
  ] },
  { emoji: '📏', title: 'Resistivity', story: 'A wire is stretched to twice its length (same material and thickness). Its resistance…', idea: 'R = ρL/A', options: [
    { text: 'doubles', ok: true, why: 'R is proportional to length.' },
    { text: 'halves', ok: false, why: 'Longer wire, more resistance.' },
    { text: 'stays the same', ok: false, why: 'Length affects resistance.' },
    { text: 'becomes four times', ok: false, why: 'Only if the area also halves.' },
  ] },
  { emoji: '🧲', title: 'Thumb rule', story: 'A current flows upwards in a vertical wire. Looking down from above, what is the direction of the magnetic field around it?', idea: 'Right-hand thumb rule', options: [
    { text: 'Anticlockwise', ok: true, why: 'Thumb up, fingers curl anticlockwise (seen from above).' },
    { text: 'Clockwise', ok: false, why: 'That’s for current flowing down.' },
    { text: 'Upwards along the wire', ok: false, why: 'The field circles the wire.' },
    { text: 'There is no field', ok: false, why: 'Every current makes a magnetic field.' },
  ] },
  { emoji: '🌀', title: 'Motor rule', story: 'In Fleming’s left-hand rule, what does the thumb show?', idea: 'FBI: Field, current, Motion', options: [
    { text: 'The direction of the force (motion)', ok: true, why: 'First finger field, second finger current, thumb motion.' },
    { text: 'The magnetic field', ok: false, why: 'That’s the first finger.' },
    { text: 'The current', ok: false, why: 'That’s the second finger.' },
    { text: 'The voltage', ok: false, why: 'Voltage isn’t part of the rule.' },
  ] },
  { emoji: '🛡️', title: 'Safety', story: 'What is the job of the earth wire?', idea: 'Protects if a metal case becomes live', options: [
    { text: 'It carries current safely to the ground if a metal appliance becomes live', ok: true, why: 'The large current also trips the fuse or MCB.' },
    { text: 'It carries the normal current', ok: false, why: 'That’s the live and neutral wires.' },
    { text: 'It saves electricity', ok: false, why: 'It’s for safety, not saving energy.' },
    { text: 'It makes appliances work faster', ok: false, why: 'It has no effect on normal working.' },
  ] },
]

export default function CircuitMaster() {
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
      if (!useProgress.getState().badges.includes('circuit-master')) addXp(25 + hearts * 10, 'Circuit Master!')
      awardBadge('circuit-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="circuit-master" title="Boss Challenge: Circuit Master" subtitle="Ten problems on Ohm's law, resistors, power and magnetism." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">⚡</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Circuit Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Physics idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
