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
  { emoji: '☀️', title: '10% law', story: 'A plant stores 10,000 J. About how much energy reaches a secondary consumer?', idea: 'Only about 10% passes on at each step', options: [
    { text: '100 J', ok: true, why: '10,000 → 1,000 → 100.' },
    { text: '1,000 J', ok: false, why: 'That is the primary consumer.' },
    { text: '10 J', ok: false, why: 'That is one more step.' },
    { text: '10,000 J', ok: false, why: 'Energy is lost at each step.' },
  ] },
  { emoji: '🔗', title: 'Short chains', story: 'Why do food chains rarely have more than four or five steps?', idea: 'Energy runs out', options: [
    { text: 'Too little energy is left at the higher levels', ok: true, why: 'Most energy is lost as heat at each step.' },
    { text: 'Animals would be too big', ok: false, why: 'Size isn’t the reason.' },
    { text: 'Plants can’t grow tall enough', ok: false, why: 'Plant height isn’t the reason.' },
    { text: 'Decomposers eat the top predators', ok: false, why: 'Decomposers feed at every level.' },
  ] },
  { emoji: '🦅', title: 'Top of the chain', story: 'Where in a food chain is the concentration of DDT highest?', idea: 'Biological magnification', options: [
    { text: 'In the top predator', ok: true, why: 'It builds up at each level.' },
    { text: 'In the producers', ok: false, why: 'Producers have the least.' },
    { text: 'In the water', ok: false, why: 'The water has the lowest concentration.' },
    { text: 'The same at every level', ok: false, why: 'It increases up the chain.' },
  ] },
  { emoji: '🍄', title: 'Decomposers', story: 'What is the role of decomposers?', idea: 'Recycling', options: [
    { text: 'They break down dead matter and return nutrients to the soil', ok: true, why: 'Without them, nutrients would stay locked in dead bodies.' },
    { text: 'They make food from sunlight', ok: false, why: 'That is producers.' },
    { text: 'They eat only living plants', ok: false, why: 'That is herbivores.' },
    { text: 'They produce oxygen', ok: false, why: 'Plants do that.' },
  ] },
  { emoji: '🛡️', title: 'Ozone', story: 'Why is the ozone layer important?', idea: 'O₃ high in the atmosphere', options: [
    { text: 'It absorbs harmful ultraviolet (UV) radiation from the Sun', ok: true, why: 'UV can cause skin cancer and cataracts.' },
    { text: 'It keeps the Earth warm', ok: false, why: 'That is the greenhouse effect.' },
    { text: 'It makes rain', ok: false, why: 'Rain comes from water vapour.' },
    { text: 'It gives us oxygen to breathe', ok: false, why: 'We breathe O₂, made at ground level.' },
  ] },
  { emoji: '🧊', title: 'CFCs', story: 'Which chemicals were mainly responsible for thinning the ozone layer?', idea: 'Once used in fridges and sprays', options: [
    { text: 'CFCs (chlorofluorocarbons)', ok: true, why: 'They were phased out under the Montreal Protocol (1987).' },
    { text: 'Carbon dioxide', ok: false, why: 'CO₂ is a greenhouse gas.' },
    { text: 'Oxygen', ok: false, why: 'Ozone is made from oxygen.' },
    { text: 'Water vapour', ok: false, why: 'Water vapour doesn’t destroy ozone.' },
  ] },
  { emoji: '🍌', title: 'Biodegradable', story: 'Which of these is biodegradable?', idea: 'Microbes can break it down', options: [
    { text: 'Vegetable peels', ok: true, why: 'They rot in weeks.' },
    { text: 'Plastic bottle', ok: false, why: 'It lasts hundreds of years.' },
    { text: 'Glass jar', ok: false, why: 'Glass doesn’t decompose.' },
    { text: 'Aluminium foil', ok: false, why: 'Metals don’t biodegrade.' },
  ] },
  { emoji: '♻️', title: '3 Rs', story: 'Taking a cloth bag to the market instead of a new plastic bag is an example of…', idea: 'Using less in the first place', options: [
    { text: 'Reduce', ok: true, why: 'Using less waste in the first place.' },
    { text: 'Recycle', ok: false, why: 'Recycling remakes used material.' },
    { text: 'Reuse', ok: false, why: 'Reuse means using an item again; this avoids the item altogether.' },
    { text: 'Refuse to shop', ok: false, why: 'You still shop, with less waste.' },
  ] },
  { emoji: '🐍', title: 'Remove a link', story: 'In grass → grasshopper → frog → snake, what happens first if all the frogs are removed?', idea: 'Follow the arrows both ways', options: [
    { text: 'Grasshoppers increase and snakes decrease', ok: true, why: 'Grasshoppers lose a predator; snakes lose food.' },
    { text: 'Grass increases and grasshoppers decrease', ok: false, why: 'Grasshoppers increase at first.' },
    { text: 'Nothing changes', ok: false, why: 'Every link matters.' },
    { text: 'Snakes increase', ok: false, why: 'Snakes lose their food.' },
  ] },
  { emoji: '🪱', title: 'Trophic level', story: 'In grass → deer → tiger, what is the trophic level of the tiger?', idea: 'Count from the producer', options: [
    { text: 'Third trophic level (secondary consumer)', ok: true, why: 'Producer = 1st, herbivore = 2nd, carnivore = 3rd.' },
    { text: 'First trophic level', ok: false, why: 'That is the grass.' },
    { text: 'Second trophic level', ok: false, why: 'That is the deer.' },
    { text: 'Fourth trophic level', ok: false, why: 'There are only three levels here.' },
  ] },
]

export default function EnvironmentMaster() {
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
      if (!useProgress.getState().badges.includes('environment-master')) addXp(25 + hearts * 10, 'Environment Master!')
      awardBadge('environment-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="environment-master" title="Boss Challenge: Environment Master" subtitle="Ten problems on food chains, energy flow, biomagnification, ozone and waste." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌍</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Environment Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
