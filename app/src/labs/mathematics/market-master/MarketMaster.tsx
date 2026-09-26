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
  { emoji: '⚖️', title: 'Simplest form', story: 'A class has 24 girls and 36 boys. What is the ratio of girls to boys in its simplest form?', idea: 'Divide both parts by the HCF (12)', options: [
    { text: '2 : 3', ok: true, why: '24 ÷ 12 = 2 and 36 ÷ 12 = 3.' },
    { text: '3 : 2', ok: false, why: 'Order matters: girls first, then boys.' },
    { text: '12 : 18', ok: false, why: 'Equivalent, but not the simplest form: both can still be divided by 6.' },
    { text: '24 : 60', ok: false, why: 'That compares girls with the whole class.' } ] },
  { emoji: '💰', title: 'Prize money', story: '₹1200 is shared in the ratio 2 : 3 : 5. How much is the largest share?', idea: 'Total parts = 10; one part = ₹120', options: [
    { text: '₹600', ok: true, why: '1200 ÷ 10 = 120, and 5 × 120 = 600.' },
    { text: '₹500', ok: false, why: 'The share is 5 parts, not ₹5 × 100.' },
    { text: '₹240', ok: false, why: 'That is the smallest share (2 parts).' },
    { text: '₹400', ok: false, why: '1200 ÷ 3 splits it equally, not in the ratio.' } ] },
  { emoji: '🖊️', title: 'Pens', story: '4 pens cost ₹60. How much do 7 pens cost?', idea: 'Unitary method: find the cost of 1', options: [
    { text: '₹105', ok: true, why: '1 pen = ₹15, so 7 pens = ₹105.' },
    { text: '₹63', ok: false, why: 'Adding 3 to 60 isn’t proportional.' },
    { text: '₹420', ok: false, why: 'That’s 60 × 7: find the price of one pen first.' },
    { text: '₹90', ok: false, why: 'That’s 6 pens.' } ] },
  { emoji: '👷', title: 'Builders', story: '6 workers build a wall in 10 days. How long would 15 workers take (at the same rate)?', idea: 'Inverse proportion: workers × days stays the same', options: [
    { text: '4 days', ok: true, why: '6 × 10 = 60 worker-days, and 60 ÷ 15 = 4.' },
    { text: '25 days', ok: false, why: 'More workers should mean fewer days, not more.' },
    { text: '19 days', ok: false, why: 'Adding the extra workers to the days doesn’t make sense.' },
    { text: '1 day', ok: false, why: 'Check: 15 workers × 1 day is only 15 worker-days.' } ] },
  { emoji: '💯', title: 'Fraction to percent', story: 'Write 3/8 as a percentage.', idea: 'Multiply by 100%', options: [
    { text: '37.5%', ok: true, why: '3 ÷ 8 = 0.375 = 37.5%.' },
    { text: '38%', ok: false, why: 'Close, but not exact.' },
    { text: '3.8%', ok: false, why: 'That treats 3/8 as 3.8.' },
    { text: '0.375%', ok: false, why: '0.375 is the decimal; multiply by 100 for the percentage.' } ] },
  { emoji: '🧮', title: 'Percentage of', story: 'What is 20% of 450?', idea: '10% is 45, so 20% is double', options: [
    { text: '90', ok: true, why: '10% of 450 = 45; 20% = 90.' },
    { text: '45', ok: false, why: 'That’s 10%.' },
    { text: '22.5', ok: false, why: 'That’s 5%.' },
    { text: '430', ok: false, why: 'That subtracts 20 instead of taking 20%.' } ] },
  { emoji: '📈', title: 'Price rise', story: 'A bag’s price rises from ₹800 to ₹1000. What is the percentage increase?', idea: 'Change ÷ original × 100', options: [
    { text: '25%', ok: true, why: '200 ÷ 800 × 100 = 25%.' },
    { text: '20%', ok: false, why: 'That divides by the new price. Always use the original.' },
    { text: '200%', ok: false, why: '₹200 is the change, not a percentage.' },
    { text: '80%', ok: false, why: '800 is 80% of 1000, but that’s a different question.' } ] },
  { emoji: '🏷️', title: 'Sale', story: 'A bat is marked ₹2000 with a 15% discount. What is the sale price?', idea: 'Price × (1 − 15/100)', options: [
    { text: '₹1700', ok: true, why: '15% of 2000 is 300; 2000 − 300 = 1700.' },
    { text: '₹1985', ok: false, why: 'That takes off ₹15, not 15%.' },
    { text: '₹300', ok: false, why: 'That’s the discount, not the price you pay.' },
    { text: '₹2300', ok: false, why: 'A discount lowers the price.' } ] },
  { emoji: '🏦', title: 'Compound interest', story: '₹10,000 is invested at 10% a year, compounded yearly. What is it worth after 2 years?', idea: 'Multiply by 1.1 each year', options: [
    { text: '₹12,100', ok: true, why: '10,000 × 1.1 = 11,000; × 1.1 = 12,100.' },
    { text: '₹12,000', ok: false, why: 'That’s simple interest: it forgets interest on the interest.' },
    { text: '₹11,000', ok: false, why: 'That’s after 1 year.' },
    { text: '₹20,000', ok: false, why: '10% a year doesn’t double it in 2 years.' } ] },
  { emoji: '🗺️', title: 'Map reading', story: 'A map has a scale of 1 : 50,000. Two villages are 4 cm apart on the map. How far apart are they really?', idea: 'Real = map × 50,000; then convert units', options: [
    { text: '2 km', ok: true, why: '4 × 50,000 = 2,00,000 cm = 2,000 m = 2 km.' },
    { text: '20 km', ok: false, why: '2,00,000 cm is 2 km: divide by 1,00,000.' },
    { text: '200 m', ok: false, why: '2,00,000 cm is 2,000 m, not 200 m.' },
    { text: '12.5 km', ok: false, why: 'Multiply the map distance by the scale; don’t divide.' } ] },
]

export default function MarketMaster() {
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
      if (!useProgress.getState().badges.includes('market-master')) addXp(25 + hearts * 10, 'Market Master!')
      awardBadge('market-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="market-master" title="Boss Challenge: Market Master" subtitle="Ten real-life problems on ratio, proportion, percentages and interest." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🏪</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Market Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
