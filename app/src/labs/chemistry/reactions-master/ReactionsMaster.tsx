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
  { emoji: '⚖️', title: 'Balance it', story: 'Balance: _H₂ + _O₂ → _H₂O', idea: 'Balance O first, then H', options: [
    { text: '2H₂ + O₂ → 2H₂O', ok: true, why: '4 H and 2 O on each side.' },
    { text: 'H₂ + O₂ → H₂O', ok: false, why: 'Oxygen doesn’t balance: 2 on the left, 1 on the right.' },
    { text: 'H₂ + O₂ → H₂O₂', ok: false, why: 'Changing the formula makes a different substance.' },
    { text: '2H₂ + 2O₂ → 2H₂O', ok: false, why: 'Now there are 4 O on the left.' },
  ] },
  { emoji: '🔥', title: 'Methane', story: 'Balance: CH₄ + _O₂ → CO₂ + _H₂O', idea: 'Count C, then H, then O', options: [
    { text: '2 and 2', ok: true, why: 'CH₄ + 2O₂ → CO₂ + 2H₂O.' },
    { text: '1 and 1', ok: false, why: 'H and O don’t balance.' },
    { text: '3 and 2', ok: false, why: 'That gives 6 O on the left.' },
    { text: '2 and 4', ok: false, why: 'That gives 8 H on the right.' },
  ] },
  { emoji: '🤝', title: 'Combination', story: 'CaO + H₂O → Ca(OH)₂. What type of reaction is this?', idea: 'Two substances combine into one', options: [
    { text: 'Combination', ok: true, why: 'A + B → AB.' },
    { text: 'Decomposition', ok: false, why: 'Nothing breaks apart.' },
    { text: 'Displacement', ok: false, why: 'No element is pushed out.' },
    { text: 'Double displacement', ok: false, why: 'There is only one product.' },
  ] },
  { emoji: '💔', title: 'Heat it', story: 'Heating limestone: CaCO₃ → CaO + CO₂. What type?', idea: 'One substance breaks down', options: [
    { text: 'Thermal decomposition', ok: true, why: 'Heat breaks CaCO₃ into two products.' },
    { text: 'Combination', ok: false, why: 'That is the reverse.' },
    { text: 'Displacement', ok: false, why: 'No element replaces another.' },
    { text: 'Neutralisation', ok: false, why: 'No acid or base.' },
  ] },
  { emoji: '🔩', title: 'Iron nail', story: 'An iron nail is placed in blue copper sulfate solution. What do you see?', idea: 'A more reactive metal displaces a less reactive one', options: [
    { text: 'The nail turns brown and the solution turns pale green', ok: true, why: 'Iron displaces copper: Fe + CuSO₄ → FeSO₄ + Cu.' },
    { text: 'Nothing happens', ok: false, why: 'Iron is more reactive than copper.' },
    { text: 'The solution turns darker blue', ok: false, why: 'Blue copper ions are used up.' },
    { text: 'The nail dissolves completely at once', ok: false, why: 'The change is gradual and visible.' },
  ] },
  { emoji: '🌨️', title: 'Precipitate', story: 'Mixing sodium sulfate and barium chloride solutions gives a white solid. What type of reaction?', idea: 'Ions swap partners', options: [
    { text: 'Double displacement (precipitation)', ok: true, why: 'BaSO₄ is insoluble and precipitates.' },
    { text: 'Combination', ok: false, why: 'Two new compounds form.' },
    { text: 'Decomposition', ok: false, why: 'Nothing breaks down.' },
    { text: 'Combustion', ok: false, why: 'Nothing burns.' },
  ] },
  { emoji: '🟢', title: 'Oxidised?', story: 'In CuO + H₂ → Cu + H₂O, which substance is oxidised?', idea: 'Oxidation = gain of oxygen', options: [
    { text: 'H₂', ok: true, why: 'Hydrogen gains oxygen to form water.' },
    { text: 'CuO', ok: false, why: 'CuO loses oxygen: it is reduced.' },
    { text: 'Cu', ok: false, why: 'Copper is a product.' },
    { text: 'H₂O', ok: false, why: 'Water is a product.' },
  ] },
  { emoji: '🟥', title: 'Rust', story: 'Which conditions are needed for iron to rust?', idea: 'Rusting needs air and water', options: [
    { text: 'Both oxygen and water', ok: true, why: 'Iron + oxygen + water → hydrated iron oxide.' },
    { text: 'Oxygen only', ok: false, why: 'Iron in dry air barely rusts.' },
    { text: 'Water only', ok: false, why: 'Iron in boiled, oil-sealed water barely rusts.' },
    { text: 'Sunlight only', ok: false, why: 'Light isn’t needed.' },
  ] },
  { emoji: '🍟', title: 'Chips packet', story: 'Why are chips packets filled with nitrogen gas?', idea: 'Prevent oxidation of fats (rancidity)', options: [
    { text: 'To stop the oil in the chips being oxidised and going rancid', ok: true, why: 'Nitrogen is unreactive and keeps oxygen out.' },
    { text: 'To make the chips crunchier', ok: false, why: 'Crunchiness isn’t the main reason.' },
    { text: 'Because nitrogen is a flavour', ok: false, why: 'Nitrogen has no taste.' },
    { text: 'To add weight', ok: false, why: 'Nitrogen adds almost no weight.' },
  ] },
  { emoji: '🌡️', title: 'Exothermic', story: 'Which is an exothermic reaction?', idea: 'Exothermic reactions release heat', options: [
    { text: 'Respiration of glucose', ok: true, why: 'Respiration releases energy.' },
    { text: 'Photosynthesis', ok: false, why: 'That absorbs light energy.' },
    { text: 'Decomposing limestone', ok: false, why: 'That needs heat.' },
    { text: 'Melting ice', ok: false, why: 'That’s a physical change that absorbs heat.' },
  ] },
]

export default function ReactionsMaster() {
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
      if (!useProgress.getState().badges.includes('reactions-master')) addXp(25 + hearts * 10, 'Reaction Master!')
      awardBadge('reactions-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="reactions-master" title="Boss Challenge: Reaction Master" subtitle="Ten problems on balancing, types of reactions and redox." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">⚗️</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Reaction Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
