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
  { emoji: '💧', title: 'Molecular mass', story: 'What is the molecular mass of water, H₂O? (H = 1 u, O = 16 u)', idea: 'Add up the masses of all the atoms', options: [
    { text: '18 u', ok: true, why: '2 × 1 + 16 = 18 u.' },
    { text: '17 u', ok: false, why: 'There are TWO hydrogen atoms.' },
    { text: '32 u', ok: false, why: 'That uses two oxygens.' },
    { text: '3 u', ok: false, why: 'That counts atoms, not their masses.' } ] },
  { emoji: '🫧', title: 'Carbon dioxide', story: 'What is the molar mass of CO₂? (C = 12, O = 16)', idea: 'Molar mass in g/mol = molecular mass in u', options: [
    { text: '44 g/mol', ok: true, why: '12 + 2 × 16 = 44.' },
    { text: '28 g/mol', ok: false, why: 'That has only one oxygen.' },
    { text: '40 g/mol', ok: false, why: 'Check: 12 + 32.' },
    { text: '192 g/mol', ok: false, why: 'Add the masses; don’t multiply them.' } ] },
  { emoji: '🧺', title: 'Grams to moles', story: 'How many moles are in 36 g of water? (M = 18 g/mol)', idea: 'n = m ÷ M', options: [
    { text: '2 mol', ok: true, why: '36 ÷ 18 = 2 mol.' },
    { text: '648 mol', ok: false, why: 'Divide, don’t multiply.' },
    { text: '0.5 mol', ok: false, why: 'That’s 18 ÷ 36.' },
    { text: '54 mol', ok: false, why: 'Don’t add mass and molar mass.' } ] },
  { emoji: '🔬', title: 'Counting particles', story: 'How many atoms are in 0.5 mol of carbon?', idea: 'N = n × 6.022 × 10²³', options: [
    { text: '3.011 × 10²³', ok: true, why: '0.5 × 6.022 × 10²³.' },
    { text: '6.022 × 10²³', ok: false, why: 'That’s one whole mole.' },
    { text: '12', ok: false, why: '12 g is the mass of one mole of carbon.' },
    { text: '1.2044 × 10²⁴', ok: false, why: 'That’s two moles.' } ] },
  { emoji: '⚖️', title: 'Moles to grams', story: 'What is the mass of 3 mol of salt, NaCl? (M = 58.5 g/mol)', idea: 'm = n × M', options: [
    { text: '175.5 g', ok: true, why: '3 × 58.5 = 175.5 g.' },
    { text: '19.5 g', ok: false, why: 'Multiply, don’t divide.' },
    { text: '61.5 g', ok: false, why: 'Don’t add.' },
    { text: '58.5 g', ok: false, why: 'That’s just one mole.' } ] },
  { emoji: '✖️', title: 'Criss-cross', story: 'What is the formula of aluminium oxide? (Al³⁺, O²⁻)', idea: 'Swap the valencies so the charges balance', options: [
    { text: 'Al₂O₃', ok: true, why: '2 × (+3) + 3 × (−2) = 0.' },
    { text: 'Al₃O₂', ok: false, why: 'The numbers should cross over: Al takes oxygen’s 2.' },
    { text: 'AlO', ok: false, why: '+3 and −2 don’t balance.' },
    { text: 'Al₂O', ok: false, why: '+6 and −2 don’t balance.' } ] },
  { emoji: '🧱', title: 'Brackets', story: 'What is the formula of calcium hydroxide? (Ca²⁺, OH⁻)', idea: 'Polyatomic ions go in brackets when there’s more than one', options: [
    { text: 'Ca(OH)₂', ok: true, why: 'One Ca²⁺ needs two OH⁻ ions.' },
    { text: 'CaOH₂', ok: false, why: 'Without brackets this means 1 O and 2 H.' },
    { text: 'CaOH', ok: false, why: 'The charges don’t balance.' },
    { text: 'Ca₂OH', ok: false, why: 'The crossing is the wrong way round.' } ] },
  { emoji: '⚛️', title: 'Valency', story: 'Nitrogen has the electron arrangement 2, 5. What is its valency?', idea: 'Valency = electrons gained, lost or shared to fill the outer shell', options: [
    { text: '3', ok: true, why: 'It gains 3 electrons to have 8 in its outer shell.' },
    { text: '5', ok: false, why: 'Losing 5 is much harder than gaining 3.' },
    { text: '7', ok: false, why: '2 + 5 is the total number of electrons.' },
    { text: '2', ok: false, why: 'The first shell is already full.' } ] },
  { emoji: '🔥', title: 'Constant proportions', story: '9 g of water always contains 1 g of hydrogen. How much hydrogen is in 45 g of pure water?', idea: 'A compound has a fixed ratio by mass', options: [
    { text: '5 g', ok: true, why: '45 ÷ 9 = 5, so 5 × 1 g = 5 g.' },
    { text: '1 g', ok: false, why: 'More water contains more hydrogen, in the same ratio.' },
    { text: '40 g', ok: false, why: 'That’s the oxygen.' },
    { text: 'It depends on where the water came from', ok: false, why: 'Pure water always has the same ratio.' } ] },
  { emoji: '⚖️', title: 'Conservation of mass', story: '10 g of calcium carbonate is heated and gives off 4.4 g of carbon dioxide. What mass of calcium oxide is left?', idea: 'Total mass before = total mass after', options: [
    { text: '5.6 g', ok: true, why: '10 − 4.4 = 5.6 g.' },
    { text: '14.4 g', ok: false, why: 'Mass isn’t added: the CO₂ came out of the calcium carbonate.' },
    { text: '10 g', ok: false, why: 'Some mass left as gas.' },
    { text: '4.4 g', ok: false, why: 'That’s the gas.' } ] },
]

export default function MoleMaster() {
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
      if (!useProgress.getState().badges.includes('mole-master')) addXp(25 + hearts * 10, 'Mole Master!')
      awardBadge('mole-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="mole-master" title="Boss Challenge: Mole Master" subtitle="Ten problems on formulae, valency, molecular mass and the mole." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧺</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Mole Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
