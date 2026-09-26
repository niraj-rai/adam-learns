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
  { emoji: '📦', title: 'Pushing a box', story: 'You push a box 5 m across the floor with a steady force of 40 N. How much work do you do?', idea: 'W = F × s', options: [
    { text: '200 J', ok: true, why: '40 × 5 = 200 J.' },
    { text: '8 J', ok: false, why: 'That’s 40 ÷ 5; multiply instead.' },
    { text: '45 J', ok: false, why: 'Multiply force and distance; don’t add them.' },
    { text: '200 W', ok: false, why: 'Work is measured in joules; watts are for power.' } ] },
  { emoji: '🏋️', title: 'Holding still', story: 'A weightlifter holds a 1500 N barbell perfectly still above her head for 3 s. How much work does she do on the barbell?', idea: 'No displacement means no work', options: [
    { text: '0 J', ok: true, why: 'The barbell doesn’t move, so W = F × 0 = 0 (even though she gets tired).' },
    { text: '4500 J', ok: false, why: '1500 × 3 multiplies by time, not distance.' },
    { text: '500 J', ok: false, why: 'Dividing by time gives nothing useful here.' },
    { text: '1500 J', ok: false, why: 'Work needs the force to move something.' } ] },
  { emoji: '🏏', title: 'Fast ball', story: 'A 0.16 kg cricket ball is bowled at 30 m/s. What is its kinetic energy?', idea: 'KE = ½mv²', options: [
    { text: '72 J', ok: true, why: '½ × 0.16 × 30² = 0.08 × 900 = 72 J.' },
    { text: '2.4 J', ok: false, why: 'Square the speed: v² = 900.' },
    { text: '144 J', ok: false, why: 'Don’t forget the ½.' },
    { text: '4.8 J', ok: false, why: 'That’s the momentum (0.16 × 30), not the energy.' } ] },
  { emoji: '🚗', title: 'Double the speed', story: 'A car speeds up from 10 m/s to 20 m/s. What happens to its kinetic energy?', idea: 'KE depends on v², so doubling v multiplies KE by 4', options: [
    { text: 'It becomes 4 times bigger', ok: true, why: '(2v)² = 4v².' },
    { text: 'It doubles', ok: false, why: 'KE depends on the square of speed.' },
    { text: 'It stays the same', ok: false, why: 'Faster means more kinetic energy.' },
    { text: 'It becomes 8 times bigger', ok: false, why: 'That would need speed cubed.' } ] },
  { emoji: '🏢', title: 'Lift to the roof', story: 'A 20 kg bag of cement is lifted 10 m to a roof (g = 9.8 N/kg). How much potential energy does it gain?', idea: 'PE = mgh', options: [
    { text: '1960 J', ok: true, why: '20 × 9.8 × 10 = 1960 J.' },
    { text: '200 J', ok: false, why: 'You forgot g.' },
    { text: '196 J', ok: false, why: 'Multiply by the height too.' },
    { text: '39.2 J', ok: false, why: 'Multiply all three: m, g and h.' } ] },
  { emoji: '🥭', title: 'Falling mango', story: 'A mango falls from a 5 m branch. Ignoring air resistance, how fast is it moving just before it lands (g = 10 N/kg)?', idea: 'PE lost = KE gained, so v = √(2gh)', options: [
    { text: '10 m/s', ok: true, why: '√(2 × 10 × 5) = √100 = 10 m/s.' },
    { text: '50 m/s', ok: false, why: 'Take the square root of 2gh.' },
    { text: '100 m/s', ok: false, why: 'That’s v², not v.' },
    { text: 'It depends on the mango’s mass', ok: false, why: 'Mass cancels: every object lands at the same speed.' } ] },
  { emoji: '🎢', title: 'Roller coaster', story: 'A roller coaster car is released from rest at the top of a hill. Which energy change happens as it rolls down?', idea: 'Energy changes form but the total is conserved', options: [
    { text: 'Potential energy → kinetic energy (plus some heat and sound)', ok: true, why: 'Height is traded for speed; friction wastes a little as heat and sound.' },
    { text: 'Kinetic energy → potential energy', ok: false, why: 'That happens going UP a hill.' },
    { text: 'Energy is created by gravity', ok: false, why: 'Energy is never created, only changed from one form to another.' },
    { text: 'Heat energy → kinetic energy', ok: false, why: 'Heat is produced, not used, by friction.' } ] },
  { emoji: '🏃', title: 'Stair race', story: 'Two students of equal mass run up the same stairs. Asha takes 10 s and Ravi takes 20 s. Compare their work and power.', idea: 'Same work, less time means more power', options: [
    { text: 'Same work; Asha’s power is double', ok: true, why: 'Work = mgh is the same; P = W ÷ t, so half the time means double the power.' },
    { text: 'Asha does double the work', ok: false, why: 'Same mass, same height: same work.' },
    { text: 'Ravi has more power because he works longer', ok: false, why: 'Power is work per second, so slower means less power.' },
    { text: 'Same work and same power', ok: false, why: 'Power depends on the time taken.' } ] },
  { emoji: '💡', title: 'Electricity units', story: 'A 2000 W water heater runs for 30 minutes. How many units (kWh) does it use?', idea: 'kWh = kW × hours', options: [
    { text: '1 kWh', ok: true, why: '2 kW × 0.5 h = 1 kWh.' },
    { text: '60 kWh', ok: false, why: 'Convert watts to kilowatts and minutes to hours.' },
    { text: '1000 kWh', ok: false, why: '2000 W is only 2 kW.' },
    { text: '4 kWh', ok: false, why: '30 minutes is half an hour, not two hours.' } ] },
  { emoji: '⚖️', title: 'Crowbar', story: 'A crowbar lifts a 900 N rock using an effort of 300 N. What is its mechanical advantage?', idea: 'MA = load ÷ effort', options: [
    { text: '3', ok: true, why: '900 ÷ 300 = 3: the effort is multiplied three times.' },
    { text: '1/3', ok: false, why: 'That’s effort ÷ load; MA is load ÷ effort.' },
    { text: '1200', ok: false, why: 'Divide, don’t add.' },
    { text: '270 000', ok: false, why: 'Divide, don’t multiply.' } ] },
]

export default function EnergyMaster() {
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
      if (!useProgress.getState().badges.includes('energy-master')) addXp(25 + hearts * 10, 'Energy Master!')
      awardBadge('energy-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="energy-master" title="Boss Challenge: Energy Master" subtitle="Ten problems on work, energy, power and machines." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">⚡</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Energy Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
