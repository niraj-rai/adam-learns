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
  { emoji: '💪', title: 'Body builders', story: 'Which food group helps us grow and repair our body?', idea: 'Dal, eggs, milk, paneer', options: [
    { text: 'Proteins', ok: true, why: 'Proteins build muscles and repair the body.' },
    { text: 'Fats', ok: false, why: 'Fats give energy.' },
    { text: 'Carbohydrates', ok: false, why: 'They give energy.' },
    { text: 'Water', ok: false, why: 'Water is vital but doesn’t build the body.' },
  ] },
  { emoji: '🍚', title: 'Energy food', story: 'Rice and roti mainly give us…', idea: 'Energy-giving foods', options: [
    { text: 'Carbohydrates for energy', ok: true, why: 'They are our main energy foods.' },
    { text: 'Vitamins only', ok: false, why: 'Fruits and vegetables give most vitamins.' },
    { text: 'Proteins only', ok: false, why: 'Dal has more protein.' },
    { text: 'Nothing useful', ok: false, why: 'They give lots of energy.' },
  ] },
  { emoji: '🥕', title: 'Protective', story: 'Why should we eat fruits and vegetables?', idea: 'Protective foods', options: [
    { text: 'They give vitamins, minerals and fibre that keep us healthy', ok: true, why: 'They protect us from illness.' },
    { text: 'They are the only source of energy', ok: false, why: 'Cereals give more energy.' },
    { text: 'They build muscles most', ok: false, why: 'That is proteins.' },
    { text: 'They have no use', ok: false, why: 'They are very important.' },
  ] },
  { emoji: '🍞', title: 'Spoilt', story: 'Green fuzz on old bread is…', idea: 'A tiny living thing', options: [
    { text: 'Mould, a fungus', ok: true, why: 'Mould grows on food kept too long, especially when damp.' },
    { text: 'Paint', ok: false, why: 'It is alive.' },
    { text: 'Sugar', ok: false, why: 'Sugar isn’t green and fuzzy.' },
    { text: 'Salt', ok: false, why: 'Salt is white crystals.' },
  ] },
  { emoji: '🥒', title: 'Pickles', story: 'How does lots of salt or oil keep pickles from spoiling?', idea: 'Microbes can’t grow', options: [
    { text: 'It stops microbes from growing', ok: true, why: 'Salt, sugar and oil are old ways to preserve food.' },
    { text: 'It makes pickles taste bad', ok: false, why: 'It keeps them tasty.' },
    { text: 'It freezes them', ok: false, why: 'Pickles aren’t frozen.' },
    { text: 'It adds vitamins', ok: false, why: 'That isn’t the reason.' },
  ] },
  { emoji: '🐫', title: 'Desert', story: 'Which animal is well adapted to the hot, dry Thar desert?', idea: 'Stores fat, needs little water', options: [
    { text: 'Camel', ok: true, why: 'Long legs, thick lips and a hump full of fat.' },
    { text: 'Polar bear', ok: false, why: 'It lives in the Arctic.' },
    { text: 'Fish', ok: false, why: 'Fish need water.' },
    { text: 'Penguin', ok: false, why: 'Penguins live in cold places.' },
  ] },
  { emoji: '🐸', title: 'Wet home', story: 'A frog lives both in water and on land. What is its habitat?', idea: 'Near water', options: [
    { text: 'Ponds and wet places near them', ok: true, why: 'Frogs lay eggs in water.' },
    { text: 'Deserts', ok: false, why: 'Too dry.' },
    { text: 'Snowy mountain tops', ok: false, why: 'Too cold.' },
    { text: 'Only deep ocean', ok: false, why: 'Frogs need fresh water.' },
  ] },
  { emoji: '🏞️', title: 'River', story: 'Where does a river like the Ganga begin?', idea: 'High and cold', options: [
    { text: 'In a glacier high in the mountains', ok: true, why: 'The Ganga starts at the Gangotri glacier.' },
    { text: 'In the sea', ok: false, why: 'Rivers flow into the sea.' },
    { text: 'In a city', ok: false, why: 'Cities grow beside rivers.' },
    { text: 'In a desert', ok: false, why: 'Deserts have little water.' },
  ] },
  { emoji: '♻️', title: 'Reuse', story: 'Which is an example of reusing?', idea: 'Use it again', options: [
    { text: 'Using a glass jam jar to store pencils', ok: true, why: 'The same jar gets a second life.' },
    { text: 'Throwing the jar away', ok: false, why: 'That wastes it.' },
    { text: 'Buying a new jar', ok: false, why: 'That adds waste.' },
    { text: 'Burning plastic', ok: false, why: 'Burning plastic is harmful.' },
  ] },
  { emoji: '🌳', title: 'Trees', story: 'Why are trees important for our shared Earth?', idea: 'Think of air, soil and animals', options: [
    { text: 'They give oxygen, shade and homes for animals, and hold soil', ok: true, why: 'Cutting forests harms all of these.' },
    { text: 'They make noise', ok: false, why: 'Trees are quiet helpers.' },
    { text: 'Only for firewood', ok: false, why: 'They do much more.' },
    { text: 'They use up all the water', ok: false, why: 'They help the water cycle.' },
  ] },
]

export default function NatureExplorer() {
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
      if (!useProgress.getState().badges.includes('nature-explorer')) addXp(25 + hearts * 10, 'Nature Explorer!')
      awardBadge('nature-explorer')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="nature-explorer" title="Boss Challenge: Nature Explorer" subtitle="Ten Grade 5 puzzles about food, habitats and caring for our Earth." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌳</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Nature Explorer! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
              <p className="mt-1 font-semibold">🧠 Science idea: {p.idea}</p>
              {hearts > 0 ? <Button className="mt-3" autoFocus onClick={next}>{i + 1 < problems.length ? 'Next problem →' : 'Finish'}</Button> : <Button className="mt-3" variant="outline" onClick={() => setPicked(null)}>See result</Button>}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
