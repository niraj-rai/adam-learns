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
  { emoji: '🦠', title: 'Split in two', story: 'An Amoeba divides into two identical cells. This is…', idea: 'Binary fission', options: [
    { text: 'Binary fission', ok: true, why: 'The nucleus divides, then the cytoplasm splits into two.' },
    { text: 'Budding', ok: false, why: 'Budding grows a small outgrowth first.' },
    { text: 'Spore formation', ok: false, why: 'Spores are tiny cells released in large numbers.' },
    { text: 'Fertilisation', ok: false, why: 'Fertilisation needs two gametes.' } ] },
  { emoji: '🌱', title: 'Hydra’s bud', story: 'A small outgrowth forms on a Hydra, grows, and breaks off as a new Hydra. This is…', idea: 'Budding', options: [
    { text: 'Budding', ok: true, why: 'Yeast reproduces the same way.' },
    { text: 'Fragmentation', ok: false, why: 'In fragmentation the body breaks into pieces.' },
    { text: 'Binary fission', ok: false, why: 'Fission splits the parent into two equal halves.' },
    { text: 'Pollination', ok: false, why: 'Pollination happens in flowering plants.' } ] },
  { emoji: '🥔', title: 'Potato eyes', story: 'A farmer plants pieces of potato with “eyes” to grow new plants. What is this called?', idea: 'Vegetative propagation', options: [
    { text: 'Vegetative propagation', ok: true, why: 'New plants grow from the stem (tuber) buds, without seeds.' },
    { text: 'Sexual reproduction', ok: false, why: 'No gametes are involved.' },
    { text: 'Seed dispersal', ok: false, why: 'Potato eyes are buds, not seeds.' },
    { text: 'Regeneration', ok: false, why: 'That word is used for animals like Planaria.' } ] },
  { emoji: '🧬', title: 'Clones', story: 'What is the main disadvantage of asexual reproduction?', idea: 'No variation', options: [
    { text: 'All the offspring are identical, so one disease can wipe them all out', ok: true, why: 'Without variation, none may survive a change.' },
    { text: 'It is very slow', ok: false, why: 'Asexual reproduction is usually fast.' },
    { text: 'It needs two parents', ok: false, why: 'Only one parent is needed.' },
    { text: 'It needs flowers', ok: false, why: 'Many organisms without flowers reproduce asexually.' } ] },
  { emoji: '🐝', title: 'Pollination', story: 'What is pollination?', idea: 'Transfer of pollen from anther to stigma', options: [
    { text: 'The transfer of pollen from an anther to a stigma', ok: true, why: 'It comes before fertilisation.' },
    { text: 'The fusion of male and female gametes', ok: false, why: 'That is fertilisation.' },
    { text: 'The spreading of seeds', ok: false, why: 'That is seed dispersal.' },
    { text: 'The growth of a seed into a seedling', ok: false, why: 'That is germination.' } ] },
  { emoji: '🍎', title: 'After fertilisation', story: 'After fertilisation in a flower, what does the ovary become?', idea: 'Ovary → fruit, ovule → seed', options: [
    { text: 'The fruit', ok: true, why: 'The ovary wall ripens into the fruit.' },
    { text: 'The seed', ok: false, why: 'The ovule becomes the seed.' },
    { text: 'The petal', ok: false, why: 'Petals usually fall off.' },
    { text: 'The pollen tube', ok: false, why: 'The pollen tube grows from the pollen grain.' } ] },
  { emoji: '🔬', title: 'Zygote', story: 'What is a zygote?', idea: 'The cell formed at fertilisation', options: [
    { text: 'The cell formed when a male and female gamete fuse', ok: true, why: 'It divides to form the embryo.' },
    { text: 'An unfertilised egg', ok: false, why: 'An egg becomes a zygote only after fertilisation.' },
    { text: 'A pollen grain', ok: false, why: 'Pollen carries the male gametes.' },
    { text: 'A spore', ok: false, why: 'Spores come from asexual reproduction.' } ] },
  { emoji: '🧫', title: 'Where it happens', story: 'In humans, where does fertilisation normally take place?', idea: 'In the oviduct', options: [
    { text: 'In the oviduct (fallopian tube)', ok: true, why: 'The zygote then travels to the uterus.' },
    { text: 'In the uterus', ok: false, why: 'The embryo implants in the uterus, after fertilisation.' },
    { text: 'In the ovary', ok: false, why: 'The ovary releases the egg.' },
    { text: 'In the placenta', ok: false, why: 'The placenta forms later.' } ] },
  { emoji: '🤰', title: 'Placenta', story: 'What does the placenta do?', idea: 'Exchange between mother and baby', options: [
    { text: 'Passes food and oxygen to the embryo and removes its wastes', ok: true, why: 'It exchanges materials without the two bloods mixing.' },
    { text: 'Makes eggs', ok: false, why: 'Eggs are made in the ovaries.' },
    { text: 'Pushes the baby out at birth', ok: false, why: 'The uterus muscles do that.' },
    { text: 'Makes sperm', ok: false, why: 'Sperm are made in the testes.' } ] },
  { emoji: '🌈', title: 'Why variation?', story: 'Why is variation produced by sexual reproduction useful to a species?', idea: 'Variation helps survival when conditions change', options: [
    { text: 'Some individuals may survive new diseases or changes in the environment', ok: true, why: 'Different offspring give the species more chances.' },
    { text: 'All offspring become identical', ok: false, why: 'That’s the opposite of variation.' },
    { text: 'It makes reproduction faster', ok: false, why: 'Sexual reproduction is usually slower.' },
    { text: 'It removes the need for two parents', ok: false, why: 'Sexual reproduction usually involves two parents.' } ] },
]

export default function LifeMaster() {
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
      if (!useProgress.getState().badges.includes('life-master')) addXp(25 + hearts * 10, 'Life Cycle Master!')
      awardBadge('life-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="life-master" title="Boss Challenge: Life Cycle Master" subtitle="Ten problems on asexual and sexual reproduction in plants and humans." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌸</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Life Cycle Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
