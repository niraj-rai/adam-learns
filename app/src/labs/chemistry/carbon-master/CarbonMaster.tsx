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
  { emoji: '🤝', title: 'Covalent bond', story: 'What kind of bond forms when two chlorine atoms join to make Cl₂?', idea: 'Non-metals share electrons', options: [
    { text: 'A single covalent bond (one shared pair)', ok: true, why: 'Each Cl shares one electron.' },
    { text: 'An ionic bond', ok: false, why: 'Neither atom gives an electron away.' },
    { text: 'A double bond', ok: false, why: 'Only one pair is needed.' },
    { text: 'A metallic bond', ok: false, why: 'Chlorine is a non-metal.' },
  ] },
  { emoji: '4️⃣', title: 'Valency of carbon', story: 'Why does carbon usually form covalent bonds?', idea: 'Four outer electrons', options: [
    { text: 'Gaining or losing 4 electrons would take too much energy, so it shares', ok: true, why: 'It shares electrons to complete its octet.' },
    { text: 'It has a full outer shell', ok: false, why: 'It has only 4 outer electrons.' },
    { text: 'It is a metal', ok: false, why: 'Carbon is a non-metal.' },
    { text: 'It forms ions easily', ok: false, why: 'C⁴⁺ and C⁴⁻ are very unstable.' },
  ] },
  { emoji: '💎', title: 'Allotropes', story: 'Diamond and graphite are both pure carbon. Why is graphite soft and slippery?', idea: 'Structure decides properties', options: [
    { text: 'Its carbon atoms are in layers that slide over each other', ok: true, why: 'Weak forces between the layers.' },
    { text: 'It contains lead', ok: false, why: 'Pencil “lead” is graphite.' },
    { text: 'It is not really carbon', ok: false, why: 'It is pure carbon.' },
    { text: 'Its atoms are not bonded', ok: false, why: 'Each carbon bonds to three others within a layer.' },
  ] },
  { emoji: '🔗', title: 'Formula', story: 'What is the molecular formula of propane?', idea: 'Alkanes: CₙH₂ₙ₊₂', options: [
    { text: 'C₃H₈', ok: true, why: '2 × 3 + 2 = 8.' },
    { text: 'C₃H₆', ok: false, why: 'That’s propene.' },
    { text: 'C₃H₄', ok: false, why: 'That’s propyne.' },
    { text: 'C₂H₆', ok: false, why: 'That’s ethane.' },
  ] },
  { emoji: '📈', title: 'Homologous series', story: 'By what group do successive members of a homologous series differ?', idea: 'Each member adds one carbon', options: [
    { text: 'CH₂', ok: true, why: 'e.g. CH₄, C₂H₆, C₃H₈.' },
    { text: 'CH₃', ok: false, why: 'Only CH₂ is added each time.' },
    { text: 'H₂', ok: false, why: 'A carbon is added too.' },
    { text: 'C₂H₄', ok: false, why: 'That adds two carbons.' },
  ] },
  { emoji: '🍷', title: 'Name it', story: 'Which functional group does ethanol have?', idea: 'The -ol ending', options: [
    { text: '–OH (alcohol)', ok: true, why: 'Ethanol is C₂H₅OH.' },
    { text: '–COOH (carboxylic acid)', ok: false, why: 'That’s ethanoic acid.' },
    { text: '–CHO (aldehyde)', ok: false, why: 'That’s ethanal.' },
    { text: '>C=O (ketone)', ok: false, why: 'That’s propanone and others.' },
  ] },
  { emoji: '\U0001fad9', title: 'Vinegar', story: 'What is vinegar?', idea: 'A dilute carboxylic acid', options: [
    { text: 'A 5–8% solution of ethanoic acid in water', ok: true, why: 'Ethanoic acid gives the sour taste.' },
    { text: 'Pure ethanol', ok: false, why: 'Ethanol is an alcohol.' },
    { text: 'A salt solution', ok: false, why: 'It is acidic.' },
    { text: 'A soap solution', ok: false, why: 'Soap is basic.' },
  ] },
  { emoji: '🍎', title: 'Fruity smell', story: 'Warming ethanol and ethanoic acid with a little sulfuric acid gives a sweet, fruity smell. What forms?', idea: 'Acid + alcohol → ester', options: [
    { text: 'An ester (esterification)', ok: true, why: 'Ethyl ethanoate forms.' },
    { text: 'A soap', ok: false, why: 'Soap needs an oil and an alkali.' },
    { text: 'An alkane', ok: false, why: 'No alkane forms.' },
    { text: 'Carbon dioxide', ok: false, why: 'No gas is given off.' },
  ] },
  { emoji: '🧼', title: 'Micelles', story: 'How does soap remove oil from clothes?', idea: 'Hydrophobic tails, hydrophilic heads', options: [
    { text: 'Tails dissolve in the oil and heads face the water, forming micelles', ok: true, why: 'The micelles are rinsed away.' },
    { text: 'Soap burns the oil', ok: false, why: 'No combustion happens.' },
    { text: 'Soap turns oil into water', ok: false, why: 'Oil is trapped, not changed.' },
    { text: 'Heads dissolve in oil', ok: false, why: 'The ionic heads prefer water.' },
  ] },
  { emoji: '🚿', title: 'Hard water', story: 'Why do detergents work better than soap in hard water?', idea: 'Soap forms scum with Ca²⁺ and Mg²⁺', options: [
    { text: 'Detergents don’t form insoluble scum with calcium and magnesium ions', ok: true, why: 'Soap is wasted as scum.' },
    { text: 'Detergents are stronger acids', ok: false, why: 'They are not acids.' },
    { text: 'Hard water has no ions', ok: false, why: 'Hard water contains calcium and magnesium ions.' },
    { text: 'Soap doesn’t dissolve in water', ok: false, why: 'Soap dissolves in soft water.' },
  ] },
]

export default function CarbonMaster() {
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
      if (!useProgress.getState().badges.includes('carbon-master')) addXp(25 + hearts * 10, 'Carbon Master!')
      awardBadge('carbon-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="carbon-master" title="Boss Challenge: Carbon Master" subtitle="Ten problems on covalent bonds, homologous series, functional groups and soaps." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧬</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Carbon Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
