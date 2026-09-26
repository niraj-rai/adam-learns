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
  { emoji: '⚡', title: 'Powerhouse', story: 'Muscle cells need a lot of energy. Which organelle would you expect them to have lots of?', idea: 'Mitochondria release energy by respiration', options: [
    { text: 'Mitochondria', ok: true, why: 'More mitochondria means more respiration and more energy released.' },
    { text: 'Chloroplasts', ok: false, why: 'Animal cells have no chloroplasts.' },
    { text: 'Lysosomes', ok: false, why: 'Lysosomes digest waste; they don’t release energy.' },
    { text: 'Golgi apparatus', ok: false, why: 'The Golgi packages proteins.' } ] },
  { emoji: '📦', title: 'Packing department', story: 'A cell makes digestive enzymes to send outside itself. Which organelle packages them?', idea: 'The Golgi apparatus modifies and packages', options: [
    { text: 'Golgi apparatus', ok: true, why: 'It packages proteins into vesicles for export.' },
    { text: 'Nucleus', ok: false, why: 'The nucleus holds the instructions.' },
    { text: 'Cell wall', ok: false, why: 'The wall supports plant cells.' },
    { text: 'Vacuole', ok: false, why: 'The vacuole stores cell sap.' } ] },
  { emoji: '🥔', title: 'Salty chips', story: 'Potato strips are left in strong salt water for an hour. What happens to them?', idea: 'Water leaves cells in a hypertonic solution', options: [
    { text: 'They lose water by osmosis and become soft', ok: true, why: 'The salt water is more concentrated than the cells, so water moves out.' },
    { text: 'They gain water and become firm', ok: false, why: 'That happens in pure water.' },
    { text: 'Salt moves in and they swell', ok: false, why: 'The membrane controls salt; osmosis is about water.' },
    { text: 'Nothing happens', ok: false, why: 'There is a big concentration difference.' } ] },
  { emoji: '🩸', title: 'Red cells in water', story: 'Red blood cells are put into pure water. What happens?', idea: 'Animal cells have no cell wall to stop them bursting', options: [
    { text: 'They swell and burst', ok: true, why: 'Water enters by osmosis and there is no wall to resist.' },
    { text: 'They shrink', ok: false, why: 'That happens in a concentrated solution.' },
    { text: 'They become turgid and stay safe', ok: false, why: 'Only plant cells have a wall to become turgid against.' },
    { text: 'They turn into plant cells', ok: false, why: 'Cells can’t change type like that!' } ] },
  { emoji: '🌱', title: 'Growing tips', story: 'Which tissue makes a root grow longer?', idea: 'Meristematic tissue keeps dividing', options: [
    { text: 'Apical meristem', ok: true, why: 'Found at root and shoot tips; its cells divide constantly.' },
    { text: 'Xylem', ok: false, why: 'Xylem carries water.' },
    { text: 'Sclerenchyma', ok: false, why: 'Sclerenchyma cells are dead and don’t divide.' },
    { text: 'Epidermis', ok: false, why: 'The epidermis protects.' } ] },
  { emoji: '🥥', title: 'Coconut husk', story: 'The hard fibres of a coconut husk are made of which tissue?', idea: 'Sclerenchyma: dead cells with lignin', options: [
    { text: 'Sclerenchyma', ok: true, why: 'Thick lignified walls make it hard and stiff.' },
    { text: 'Parenchyma', ok: false, why: 'Parenchyma is soft, thin-walled storage tissue.' },
    { text: 'Collenchyma', ok: false, why: 'Collenchyma is flexible, not hard.' },
    { text: 'Phloem', ok: false, why: 'Phloem carries food.' } ] },
  { emoji: '💧', title: 'Water pipes', story: 'Which tissue carries water from the roots to the leaves of a tall tree?', idea: 'Xylem carries water and minerals upwards', options: [
    { text: 'Xylem', ok: true, why: 'Its vessels and tracheids are hollow tubes.' },
    { text: 'Phloem', ok: false, why: 'Phloem carries food.' },
    { text: 'Cambium', ok: false, why: 'Cambium makes the stem thicker.' },
    { text: 'Pith', ok: false, why: 'Pith is storage parenchyma.' } ] },
  { emoji: '❤️', title: 'Never tires', story: 'Which muscle is striated, branched and contracts all your life without tiring?', idea: 'Cardiac muscle is found only in the heart', options: [
    { text: 'Cardiac muscle', ok: true, why: 'Branched, striated, involuntary and fatigue-resistant.' },
    { text: 'Skeletal muscle', ok: false, why: 'Skeletal muscle tires and is voluntary.' },
    { text: 'Smooth muscle', ok: false, why: 'Smooth muscle has no stripes.' },
    { text: 'Nervous tissue', ok: false, why: 'Nerves carry messages; they don’t contract.' } ] },
  { emoji: '🩻', title: 'Blood is a tissue?', story: 'Why is blood classified as a connective tissue?', idea: 'Connective tissues have cells in a matrix', options: [
    { text: 'It has cells in a liquid matrix (plasma) and connects body parts', ok: true, why: 'Plasma is the matrix; blood links every organ.' },
    { text: 'It covers the body', ok: false, why: 'That’s epithelial tissue.' },
    { text: 'It contracts', ok: false, why: 'That’s muscle.' },
    { text: 'It sends electrical messages', ok: false, why: 'That’s nervous tissue.' } ] },
  { emoji: '💪', title: 'Arm curl', story: 'When you bend your arm at the elbow, what do the biceps and triceps do?', idea: 'Muscles work in antagonistic pairs', options: [
    { text: 'Biceps contracts; triceps relaxes', ok: true, why: 'Muscles can only pull, so one contracts while its partner relaxes.' },
    { text: 'Both contract', ok: false, why: 'Then the arm would stay still.' },
    { text: 'Triceps contracts; biceps relaxes', ok: false, why: 'That straightens the arm.' },
    { text: 'The biceps pushes the forearm', ok: false, why: 'Muscles pull; they never push.' } ] },
]

export default function TissueMaster() {
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
      if (!useProgress.getState().badges.includes('tissue-master')) addXp(25 + hearts * 10, 'Tissue Master!')
      awardBadge('tissue-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="tissue-master" title="Boss Challenge: Tissue Master" subtitle="Ten problems on organelles, osmosis, plant and animal tissues, and muscles." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🔬</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Tissue Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
