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
  { emoji: '🧪', title: 'Enzyme', story: 'Which enzyme in saliva starts the digestion of starch?', idea: 'Digestion starts in the mouth', options: [
    { text: 'Salivary amylase', ok: true, why: 'It breaks starch into maltose (a sugar).' },
    { text: 'Pepsin', ok: false, why: 'Pepsin digests protein in the stomach.' },
    { text: 'Lipase', ok: false, why: 'Lipase digests fats.' },
    { text: 'Trypsin', ok: false, why: 'Trypsin works in the small intestine on proteins.' },
  ] },
  { emoji: '🌡️', title: 'Too hot', story: 'Why does an enzyme stop working above about 60 °C?', idea: 'Enzymes are proteins with a precise shape', options: [
    { text: 'Its active site changes shape (it is denatured)', ok: true, why: 'The substrate no longer fits.' },
    { text: 'It is eaten by bacteria', ok: false, why: 'Heat, not microbes, is the cause.' },
    { text: 'It moves too slowly', ok: false, why: 'Molecules move faster when hot.' },
    { text: 'It turns into starch', ok: false, why: 'Enzymes are proteins, not carbohydrates.' },
  ] },
  { emoji: '🟢', title: 'Bile', story: 'What does bile do in digestion?', idea: 'Bile has no enzymes', options: [
    { text: 'Emulsifies fats into small droplets', ok: true, why: 'This gives lipase a bigger surface to work on.' },
    { text: 'Digests proteins', ok: false, why: 'Bile contains no enzymes.' },
    { text: 'Absorbs glucose', ok: false, why: 'Villi absorb glucose.' },
    { text: 'Kills all bacteria', ok: false, why: 'Stomach acid kills many microbes.' },
  ] },
  { emoji: '🏃', title: 'Cramp', story: 'During a sprint, what builds up in muscles when oxygen runs short?', idea: 'Anaerobic respiration in muscle', options: [
    { text: 'Lactic acid', ok: true, why: 'Glucose → lactic acid + a little energy.' },
    { text: 'Ethanol', ok: false, why: 'That is made by yeast.' },
    { text: 'Starch', ok: false, why: 'Starch is stored, not made in sprinting.' },
    { text: 'Oxygen', ok: false, why: 'Oxygen is what is lacking.' },
  ] },
  { emoji: '⚡', title: 'Energy currency', story: 'What molecule stores the energy released by respiration for use in the cell?', idea: 'The energy currency of the cell', options: [
    { text: 'ATP', ok: true, why: 'Adenosine triphosphate powers cell activities.' },
    { text: 'DNA', ok: false, why: 'DNA stores genetic information.' },
    { text: 'Glucose', ok: false, why: 'Glucose is the fuel, broken down to make ATP.' },
    { text: 'Carbon dioxide', ok: false, why: 'That is a waste product.' },
  ] },
  { emoji: '❤️', title: 'Double circulation', story: 'Why is double circulation useful to mammals and birds?', idea: 'Oxygenated and deoxygenated blood are kept apart', options: [
    { text: 'It keeps oxygenated blood separate, giving a high oxygen supply for a warm body', ok: true, why: 'Warm-blooded animals need lots of energy.' },
    { text: 'It makes blood flow slower', ok: false, why: 'It lets blood be pumped at high pressure.' },
    { text: 'It lets blood mix', ok: false, why: 'The point is that it does not mix.' },
    { text: 'It removes the need for lungs', ok: false, why: 'Blood passes through the lungs.' },
  ] },
  { emoji: '🌳', title: 'Xylem', story: 'What mainly pulls water up a tall tree?', idea: 'Water evaporates from leaves', options: [
    { text: 'Transpiration pull', ok: true, why: 'Evaporation from leaves draws a column of water up the xylem.' },
    { text: 'Phloem pressure', ok: false, why: 'Phloem carries food.' },
    { text: 'The heart of the tree', ok: false, why: 'Plants have no heart.' },
    { text: 'Gravity', ok: false, why: 'Gravity pulls down.' },
  ] },
  { emoji: '🍬', title: 'Translocation', story: 'Which tissue carries sugar from leaves to other parts of a plant?', idea: 'Transport of food in plants', options: [
    { text: 'Phloem', ok: true, why: 'This is translocation; it uses energy (ATP).' },
    { text: 'Xylem', ok: false, why: 'Xylem carries water and minerals.' },
    { text: 'Stomata', ok: false, why: 'Stomata are pores for gas exchange.' },
    { text: 'Root hairs', ok: false, why: 'Root hairs absorb water.' },
  ] },
  { emoji: '\U0001fad8', title: 'Nephron', story: 'What is the basic filtering unit of the kidney?', idea: 'Each kidney has about a million', options: [
    { text: 'The nephron', ok: true, why: 'Blood is filtered in the glomerulus into Bowman’s capsule.' },
    { text: 'The neuron', ok: false, why: 'That is a nerve cell.' },
    { text: 'The alveolus', ok: false, why: 'That is an air sac in the lungs.' },
    { text: 'The villus', ok: false, why: 'That is in the small intestine.' },
  ] },
  { emoji: '🩺', title: 'Dialysis', story: 'What does an artificial kidney (dialysis) remove from the blood?', idea: 'It does the kidneys’ job', options: [
    { text: 'Urea and other nitrogenous wastes', ok: true, why: 'Blood passes through tubes in dialysing fluid.' },
    { text: 'Red blood cells', ok: false, why: 'These must stay in the blood.' },
    { text: 'Glucose', ok: false, why: 'Glucose is kept; the fluid contains glucose.' },
    { text: 'Oxygen', ok: false, why: 'Oxygen is needed.' },
  ] },
]

export default function LifeProcessesMaster() {
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
      if (!useProgress.getState().badges.includes('life-processes-master')) addXp(25 + hearts * 10, 'Life Processes Master!')
      awardBadge('life-processes-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="life-processes-master" title="Boss Challenge: Life Processes Master" subtitle="Ten problems on nutrition, enzymes, respiration, transport and excretion." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🫀</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Life Processes Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Biology idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
