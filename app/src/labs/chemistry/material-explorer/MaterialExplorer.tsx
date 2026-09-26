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
  { emoji: '🧊', title: 'Melting', story: 'At what temperature does ice melt?', idea: 'Water’s special temperatures', options: [
    { text: '0 °C', ok: true, why: 'Water freezes and ice melts at 0 °C.' },
    { text: '100 °C', ok: false, why: 'That is where water boils.' },
    { text: '37 °C', ok: false, why: 'That is body temperature.' },
    { text: '50 °C', ok: false, why: 'Ice melts long before that.' },
  ] },
  { emoji: '♨️', title: 'Boiling', story: 'What is steam?', idea: 'Water as a gas', options: [
    { text: 'Water in its gas form', ok: true, why: 'It forms when water boils.' },
    { text: 'Smoke', ok: false, why: 'Smoke comes from burning.' },
    { text: 'A kind of ice', ok: false, why: 'Ice is solid water.' },
    { text: 'Air', ok: false, why: 'Steam is water.' },
  ] },
  { emoji: '☁️', title: 'Clouds', story: 'How do clouds form?', idea: 'Rising vapour cools', options: [
    { text: 'Water vapour cools and condenses into tiny droplets', ok: true, why: 'That is condensation.' },
    { text: 'Smoke from factories', ok: false, why: 'Clouds are water.' },
    { text: 'The Sun makes them', ok: false, why: 'The Sun makes water evaporate, but cooling makes clouds.' },
    { text: 'Rain goes up', ok: false, why: 'Rain falls down.' },
  ] },
  { emoji: '👕', title: 'Drying clothes', story: 'Wet clothes dry fastest on a…', idea: 'Evaporation likes heat and wind', options: [
    { text: 'sunny, windy day', ok: true, why: 'Heat and wind speed up evaporation.' },
    { text: 'cold, still day', ok: false, why: 'Evaporation is slow.' },
    { text: 'rainy day', ok: false, why: 'The air is already wet.' },
    { text: 'dark room', ok: false, why: 'No heat or wind.' },
  ] },
  { emoji: '🥤', title: 'Dissolving', story: 'Which dissolves in water?', idea: 'It disappears but you can taste it', options: [
    { text: 'Sugar', ok: true, why: 'It spreads out into the water.' },
    { text: 'Sand', ok: false, why: 'Sand settles at the bottom.' },
    { text: 'Oil', ok: false, why: 'Oil floats on top.' },
    { text: 'Chalk powder', ok: false, why: 'It makes the water cloudy and settles.' },
  ] },
  { emoji: '⏩', title: 'Faster', story: 'How can you make sugar dissolve faster?', idea: 'Help the particles mix', options: [
    { text: 'Stir it in warm water', ok: true, why: 'Warmth and stirring speed it up.' },
    { text: 'Use ice-cold water', ok: false, why: 'Cold slows it down.' },
    { text: 'Add a big lump', ok: false, why: 'Small grains dissolve faster.' },
    { text: 'Leave it still', ok: false, why: 'Stirring helps.' },
  ] },
  { emoji: '🪨', title: 'Separate', story: 'How can you separate sand from water?', idea: 'Sand doesn’t dissolve', options: [
    { text: 'Filter it through cloth or paper', ok: true, why: 'The sand stays behind.' },
    { text: 'Stir it more', ok: false, why: 'That mixes it.' },
    { text: 'Add sugar', ok: false, why: 'That adds something else.' },
    { text: 'Freeze it', ok: false, why: 'The sand would still be mixed in.' },
  ] },
  { emoji: '🐛', title: 'Silk', story: 'Where does silk come from?', idea: 'A caterpillar’s cocoon', options: [
    { text: 'Silkworms', ok: true, why: 'They spin cocoons of silk thread.' },
    { text: 'Cotton plants', ok: false, why: 'That is cotton.' },
    { text: 'Sheep', ok: false, why: 'That is wool.' },
    { text: 'Oil', ok: false, why: 'Polyester is made from oil.' },
  ] },
  { emoji: '🧶', title: 'Keep warm', story: 'Why do woollen clothes keep us warm?', idea: 'Wool fibres trap something', options: [
    { text: 'They trap air, which doesn’t let heat escape easily', ok: true, why: 'Trapped air is a good insulator.' },
    { text: 'Wool makes its own heat', ok: false, why: 'It only keeps our heat in.' },
    { text: 'Wool is heavy', ok: false, why: 'Weight isn’t the reason.' },
    { text: 'Wool is always dark', ok: false, why: 'Wool comes in all colours.' },
  ] },
  { emoji: '🧵', title: 'Spinning', story: 'What is spinning?', idea: 'Fibre → yarn', options: [
    { text: 'Twisting fibres together to make yarn', ok: true, why: 'Then yarn is woven or knitted into fabric.' },
    { text: 'Picking cotton', ok: false, why: 'That is harvesting.' },
    { text: 'Colouring cloth', ok: false, why: 'That is dyeing.' },
    { text: 'Stitching clothes', ok: false, why: 'That is tailoring.' },
  ] },
]

export default function MaterialExplorer() {
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
      if (!useProgress.getState().badges.includes('material-explorer')) addXp(25 + hearts * 10, 'Material Explorer!')
      awardBadge('material-explorer')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="material-explorer" title="Boss Challenge: Material Explorer" subtitle="Ten Grade 5 puzzles about water, mixing and materials for clothes." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧪</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Material Explorer! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
