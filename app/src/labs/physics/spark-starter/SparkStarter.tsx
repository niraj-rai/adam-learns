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
  { emoji: '☀️', title: 'Biggest source', story: 'Where does almost all the energy on Earth come from in the first place?', idea: 'Plants, wind and rain all depend on it', options: [
    { text: 'The Sun', ok: true, why: 'Plants capture sunlight; the Sun also drives wind and rain.' },
    { text: 'The Moon', ok: false, why: 'The Moon only reflects sunlight.' },
    { text: 'Batteries', ok: false, why: 'Batteries store energy made elsewhere.' },
    { text: 'The wind', ok: false, why: 'The Sun’s heat causes wind.' },
  ] },
  { emoji: '🔋', title: 'Torch', story: 'In a torch, the battery’s stored energy becomes…', idea: 'Follow the energy', options: [
    { text: 'Light (and a little heat)', ok: true, why: 'Chemical energy → electrical → light.' },
    { text: 'Sound', ok: false, why: 'A torch is silent.' },
    { text: 'Water', ok: false, why: 'Energy doesn’t turn into water.' },
    { text: 'Nothing: it disappears', ok: false, why: 'Energy changes form; it isn’t lost.' },
  ] },
  { emoji: '🌬️', title: 'Renewable', story: 'Which energy source will not run out?', idea: 'It is renewed by nature', options: [
    { text: 'Wind', ok: true, why: 'Wind and sunlight keep coming.' },
    { text: 'Coal', ok: false, why: 'Coal took millions of years to form.' },
    { text: 'Petrol', ok: false, why: 'Petrol comes from oil, which runs out.' },
    { text: 'Cooking gas (LPG)', ok: false, why: 'LPG also comes from oil and gas.' },
  ] },
  { emoji: '💡', title: 'Save energy', story: 'Which habit saves the most electricity?', idea: 'Don’t use what you don’t need', options: [
    { text: 'Switching off fans and lights when leaving a room', ok: true, why: 'Energy not used is energy saved.' },
    { text: 'Leaving the TV on standby all night', ok: false, why: 'Standby still uses power.' },
    { text: 'Opening the fridge often', ok: false, why: 'That lets cold air out.' },
    { text: 'Using a bulb in daylight', ok: false, why: 'Use sunlight instead.' },
  ] },
  { emoji: '🌍', title: 'Day and night', story: 'Why do we have day and night?', idea: 'Think about the Earth spinning', options: [
    { text: 'The Earth spins on its axis', ok: true, why: 'The side facing the Sun has day.' },
    { text: 'The Sun goes round the Earth', ok: false, why: 'It only looks that way.' },
    { text: 'The Moon blocks the Sun at night', ok: false, why: 'The Moon is too small and not always there.' },
    { text: 'Clouds cover the Sun', ok: false, why: 'Night comes even on clear days.' },
  ] },
  { emoji: '⏰', title: 'One spin', story: 'How long does the Earth take to spin once?', idea: 'One day', options: [
    { text: 'About 24 hours', ok: true, why: 'That is one day.' },
    { text: 'About 12 hours', ok: false, why: 'That is only day or night.' },
    { text: 'About 365 days', ok: false, why: 'That is one trip round the Sun.' },
    { text: 'About 30 days', ok: false, why: 'That is roughly the Moon’s cycle.' },
  ] },
  { emoji: '🌅', title: 'Sunrise', story: 'In which direction does the Sun rise?', idea: 'The Earth spins towards it', options: [
    { text: 'East', ok: true, why: 'That is why the east sees sunrise first.' },
    { text: 'West', ok: false, why: 'The Sun sets in the west.' },
    { text: 'North', ok: false, why: 'Not in India.' },
    { text: 'South', ok: false, why: 'Not in India.' },
  ] },
  { emoji: '🌞', title: 'Seasons', story: 'What mainly causes the seasons?', idea: 'The Earth is tilted', options: [
    { text: 'The tilt of the Earth’s axis as it goes round the Sun', ok: true, why: 'In June the northern half leans towards the Sun.' },
    { text: 'The Earth getting closer to and further from the Sun', ok: false, why: 'The distance changes very little.' },
    { text: 'The Moon', ok: false, why: 'The Moon doesn’t cause seasons.' },
    { text: 'Clouds', ok: false, why: 'Clouds don’t cause seasons.' },
  ] },
  { emoji: '🗓️', title: 'Leap year', story: 'Why does February sometimes have 29 days?', idea: 'A year is a bit longer than 365 days', options: [
    { text: 'The Earth takes about 365¼ days to go round the Sun', ok: true, why: 'Four quarters make one extra day every four years.' },
    { text: 'The Moon slows down', ok: false, why: 'The Moon isn’t the reason.' },
    { text: 'To give a holiday', ok: false, why: 'It keeps the calendar in step with the Sun.' },
    { text: 'The Earth spins faster in February', ok: false, why: 'The spin doesn’t change.' },
  ] },
  { emoji: '🌒', title: 'Moonlight', story: 'Why does the Moon shine?', idea: 'The Moon makes no light of its own', options: [
    { text: 'It reflects sunlight', ok: true, why: 'Like a mirror in the sky.' },
    { text: 'It is on fire', ok: false, why: 'It is cold rock.' },
    { text: 'It is made of light', ok: false, why: 'It is rock and dust.' },
    { text: 'Electricity', ok: false, why: 'There is no electricity on the Moon.' },
  ] },
]

export default function SparkStarter() {
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
      if (!useProgress.getState().badges.includes('spark-starter')) addXp(25 + hearts * 10, 'Spark Starter!')
      awardBadge('spark-starter')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="spark-starter" title="Boss Challenge: Spark Starter" subtitle="Ten Grade 5 puzzles about energy, day and night, and the seasons." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">✨</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Spark Starter! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
