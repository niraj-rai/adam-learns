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
  { emoji: '⚡', title: 'Reflex', story: 'In a reflex arc, which neuron carries the message from the receptor to the spinal cord?', idea: 'Receptor → sensory → relay → motor → effector', options: [
    { text: 'The sensory neuron', ok: true, why: 'Then a relay neuron passes it to a motor neuron.' },
    { text: 'The motor neuron', ok: false, why: 'That carries messages to the effector.' },
    { text: 'The brain', ok: false, why: 'Reflexes are handled by the spinal cord.' },
    { text: 'The muscle', ok: false, why: 'The muscle is the effector.' },
  ] },
  { emoji: '🔌', title: 'Synapse', story: 'How is a message passed across a synapse?', idea: 'The gap between neurons', options: [
    { text: 'By chemicals released from one neuron', ok: true, why: 'The electrical impulse triggers the release of chemicals.' },
    { text: 'By blood', ok: false, why: 'Blood is too slow and not direct.' },
    { text: 'By light', ok: false, why: 'No light is involved.' },
    { text: 'The two neurons are joined, so the current just flows', ok: false, why: 'There is a small gap.' },
  ] },
  { emoji: '🧠', title: 'Balance', story: 'Which part of the brain controls balance and posture?', idea: 'Hindbrain', options: [
    { text: 'The cerebellum', ok: true, why: 'It coordinates muscle movements.' },
    { text: 'The cerebrum', ok: false, why: 'That handles thinking and voluntary actions.' },
    { text: 'The medulla', ok: false, why: 'It controls breathing, heartbeat and reflexes like vomiting.' },
    { text: 'The pituitary', ok: false, why: 'That is a gland.' },
  ] },
  { emoji: '🌱', title: 'Phototropism', story: 'A seedling on a windowsill bends towards the light. Which hormone causes this?', idea: 'It collects on the shaded side', options: [
    { text: 'Auxin', ok: true, why: 'Cells on the shaded side grow longer.' },
    { text: 'Insulin', ok: false, why: 'That is a human hormone.' },
    { text: 'Abscisic acid', ok: false, why: 'It inhibits growth.' },
    { text: 'Adrenaline', ok: false, why: 'That is an animal hormone.' },
  ] },
  { emoji: '🦋', title: 'Mimosa', story: 'The touch-me-not plant folds its leaves when touched. How does this happen?', idea: 'No growth is involved', options: [
    { text: 'Cells change shape by moving water', ok: true, why: 'It is fast and not a tropism.' },
    { text: 'The leaves grow downwards', ok: false, why: 'Growth is too slow.' },
    { text: 'Nerves send signals', ok: false, why: 'Plants have no nerves.' },
    { text: 'Auxin moves to the leaf', ok: false, why: 'Auxin works through slow growth.' },
  ] },
  { emoji: '🍭', title: 'Diabetes', story: 'Which hormone lowers blood sugar, and which gland makes it?', idea: 'Missing in some diabetes', options: [
    { text: 'Insulin, from the pancreas', ok: true, why: 'It helps cells take in glucose.' },
    { text: 'Thyroxine, from the thyroid', ok: false, why: 'Thyroxine controls metabolism.' },
    { text: 'Adrenaline, from the adrenal', ok: false, why: 'Adrenaline raises blood sugar.' },
    { text: 'Growth hormone, from the pituitary', ok: false, why: 'That controls growth.' },
  ] },
  { emoji: '🌸', title: 'Tall × dwarf', story: 'Mendel crossed pure tall (TT) with pure dwarf (tt) pea plants. What were the F₁ plants like?', idea: 'T is dominant', options: [
    { text: 'All tall (Tt)', ok: true, why: 'Every F₁ plant has one T allele.' },
    { text: 'All dwarf', ok: false, why: 'Dwarf is recessive.' },
    { text: 'Half tall, half dwarf', ok: false, why: 'That happens with Tt × tt.' },
    { text: 'Medium height', ok: false, why: 'Pea height doesn’t blend.' },
  ] },
  { emoji: '🔢', title: 'F₂ ratio', story: 'Crossing two F₁ Tt plants gives which ratio of tall to dwarf?', idea: 'Draw a Punnett square', options: [
    { text: '3 : 1', ok: true, why: 'TT, Tt, Tt are tall; tt is dwarf.' },
    { text: '1 : 1', ok: false, why: 'That is Tt × tt.' },
    { text: '1 : 2 : 1', ok: false, why: 'That is the genotype ratio.' },
    { text: 'All tall', ok: false, why: 'One in four is tt.' },
  ] },
  { emoji: '👶', title: 'Boy or girl', story: 'Who decides the sex of a human baby?', idea: 'Eggs all carry X', options: [
    { text: 'The father’s sperm: X gives a girl, Y gives a boy', ok: true, why: 'Half of sperm carry X and half carry Y.' },
    { text: 'The mother’s egg', ok: false, why: 'Every egg carries an X.' },
    { text: 'The temperature', ok: false, why: 'That is true for some reptiles, not humans.' },
    { text: 'Diet in pregnancy', ok: false, why: 'Sex is set at fertilisation.' },
  ] },
  { emoji: '🧬', title: 'Genes', story: 'Where are genes found?', idea: 'Sections of DNA', options: [
    { text: 'On chromosomes in the nucleus', ok: true, why: 'Each gene is a section of DNA that codes for a protein.' },
    { text: 'In the cell membrane', ok: false, why: 'The membrane controls entry and exit.' },
    { text: 'Only in sperm and eggs', ok: false, why: 'Almost every cell has a full set.' },
    { text: 'In the blood plasma', ok: false, why: 'Plasma is liquid, not a cell.' },
  ] },
]

export default function HeredityMaster() {
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
      if (!useProgress.getState().badges.includes('heredity-master')) addXp(25 + hearts * 10, 'Coordination and Heredity Master!')
      awardBadge('heredity-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="heredity-master" title="Boss Challenge: Coordination and Heredity Master" subtitle="Ten problems on nerves, hormones, plant responses and inheritance." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧬</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Coordination and Heredity Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
