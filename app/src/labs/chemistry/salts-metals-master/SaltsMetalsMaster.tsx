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
  { emoji: '🧁', title: 'Baking soda', story: 'What is the chemical name of baking soda?', idea: 'NaHCO₃', options: [
    { text: 'Sodium hydrogencarbonate', ok: true, why: 'It releases CO₂ when heated, making cakes rise.' },
    { text: 'Sodium carbonate', ok: false, why: 'That’s washing soda (as Na₂CO₃·10H₂O).' },
    { text: 'Calcium oxychloride', ok: false, why: 'That’s bleaching powder.' },
    { text: 'Sodium chloride', ok: false, why: 'That’s common salt.' },
  ] },
  { emoji: '🦴', title: 'Plaster of Paris', story: 'How is plaster of Paris made?', idea: 'Heat gypsum carefully', options: [
    { text: 'By heating gypsum (CaSO₄·2H₂O) at about 373 K', ok: true, why: 'It loses 1½ molecules of water of crystallisation.' },
    { text: 'By mixing salt and water', ok: false, why: 'That just makes brine.' },
    { text: 'By passing chlorine over slaked lime', ok: false, why: 'That makes bleaching powder.' },
    { text: 'By burning limestone', ok: false, why: 'That gives quicklime.' },
  ] },
  { emoji: '💙', title: 'Blue to white', story: 'Blue copper sulfate crystals turn white when heated. Why?', idea: 'Water of crystallisation', options: [
    { text: 'They lose their water of crystallisation', ok: true, why: 'CuSO₄·5H₂O → CuSO₄ + 5H₂O.' },
    { text: 'They burn', ok: false, why: 'No combustion happens.' },
    { text: 'The copper is removed', ok: false, why: 'Copper remains in CuSO₄.' },
    { text: 'They absorb oxygen', ok: false, why: 'They lose water, not gain oxygen.' },
  ] },
  { emoji: '💗', title: 'Endpoint', story: 'In a titration of HCl with NaOH using phenolphthalein, what shows the endpoint?', idea: 'Indicator change', options: [
    { text: 'The solution turns permanently pale pink', ok: true, why: 'Phenolphthalein turns pink once the solution becomes basic.' },
    { text: 'The solution turns blue', ok: false, why: 'That’s litmus in base.' },
    { text: 'Bubbles appear', ok: false, why: 'No gas is made.' },
    { text: 'A white precipitate forms', ok: false, why: 'NaCl stays dissolved.' },
  ] },
  { emoji: '🧮', title: 'Titration maths', story: '25 mL of HCl is exactly neutralised by 20 mL of 0.1 mol/L NaOH. What is the concentration of the acid?', idea: 'Moles of NaOH = moles of HCl (1 : 1)', options: [
    { text: '0.08 mol/L', ok: true, why: 'Moles = 0.1 × 0.020 = 0.002; 0.002 ÷ 0.025 = 0.08.' },
    { text: '0.125 mol/L', ok: false, why: 'The ratio is upside down.' },
    { text: '0.1 mol/L', ok: false, why: 'The volumes differ, so the concentrations do too.' },
    { text: '2 mol/L', ok: false, why: 'Convert mL to litres.' },
  ] },
  { emoji: '⚡', title: 'Ionic bond', story: 'When sodium reacts with chlorine, what happens to the electrons?', idea: 'Metals give electrons to non-metals', options: [
    { text: 'Sodium gives one electron to chlorine', ok: true, why: 'Na → Na⁺, Cl → Cl⁻; the ions attract.' },
    { text: 'They share a pair of electrons', ok: false, why: 'Sharing is covalent bonding.' },
    { text: 'Chlorine gives an electron to sodium', ok: false, why: 'It is the other way round.' },
    { text: 'Nothing: they don’t react', ok: false, why: 'They react vigorously.' },
  ] },
  { emoji: '🔥', title: 'Molten salt', story: 'Why does solid sodium chloride not conduct electricity, while molten sodium chloride does?', idea: 'Ions must be free to move', options: [
    { text: 'In the solid the ions are fixed; when molten they can move', ok: true, why: 'Moving charged particles carry the current.' },
    { text: 'The solid has no ions', ok: false, why: 'It is made of ions.' },
    { text: 'Heat creates electrons', ok: false, why: 'Melting frees the ions.' },
    { text: 'Only liquids contain ions', ok: false, why: 'The solid has ions, but they can’t move.' },
  ] },
  { emoji: '⛏️', title: 'Extraction', story: 'How is aluminium extracted from its ore?', idea: 'Very reactive metals need electrolysis', options: [
    { text: 'Electrolysis of molten alumina', ok: true, why: 'Aluminium is too reactive to be reduced by carbon.' },
    { text: 'Reduction with carbon', ok: false, why: 'Carbon is less reactive than aluminium.' },
    { text: 'Heating the ore alone', ok: false, why: 'That only works for low-reactivity metals.' },
    { text: 'It is found free in nature', ok: false, why: 'It is always combined.' },
  ] },
  { emoji: '🟠', title: 'Refining copper', story: 'In electrolytic refining of copper, where is pure copper collected?', idea: 'Pure copper deposits on the cathode', options: [
    { text: 'On the cathode', ok: true, why: 'Copper ions from the impure anode travel to the pure cathode.' },
    { text: 'At the anode', ok: false, why: 'The impure copper is the anode.' },
    { text: 'In the electrolyte as a solid', ok: false, why: 'Impurities collect as anode mud.' },
    { text: 'As a gas', ok: false, why: 'Copper doesn’t form a gas here.' },
  ] },
  { emoji: '🥇', title: 'Native metal', story: 'Which metal is often found free (native) in the Earth’s crust?', idea: 'Unreactive metals are found uncombined', options: [
    { text: 'Gold', ok: true, why: 'Gold is so unreactive it is found as the metal.' },
    { text: 'Sodium', ok: false, why: 'Sodium is far too reactive.' },
    { text: 'Iron', ok: false, why: 'Iron is found as ores such as haematite.' },
    { text: 'Calcium', ok: false, why: 'Calcium is very reactive.' },
  ] },
]

export default function SaltsMetalsMaster() {
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
      if (!useProgress.getState().badges.includes('salts-metals-master')) addXp(25 + hearts * 10, 'Salts and Metals Master!')
      awardBadge('salts-metals-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="salts-metals-master" title="Boss Challenge: Salts and Metals Master" subtitle="Ten problems on salts, titration, ionic bonding and extracting metals." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧂</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Salts and Metals Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
