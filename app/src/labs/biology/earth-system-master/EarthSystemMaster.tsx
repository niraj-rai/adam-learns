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
  { emoji: '🌐', title: 'Five spheres', story: 'Glaciers and snow on the Himalaya belong to which sphere?', idea: 'Frozen water has its own sphere', options: [
    { text: 'Cryosphere', ok: true, why: 'Ice, snow and permafrost.' },
    { text: 'Hydrosphere', ok: false, why: 'That is liquid water.' },
    { text: 'Geosphere', ok: false, why: 'That is rock and soil.' },
    { text: 'Atmosphere', ok: false, why: 'That is the air.' },
  ] },
  { emoji: '🔗', title: 'Interaction', story: 'Rain washes soil from a bare hillside into a river. Which spheres interact?', idea: 'Water acting on rock and soil', options: [
    { text: 'Hydrosphere and geosphere', ok: true, why: 'Water erodes soil.' },
    { text: 'Atmosphere and cryosphere', ok: false, why: 'No ice or air change is involved.' },
    { text: 'Biosphere only', ok: false, why: 'The main change is soil and water.' },
    { text: 'None: it is one sphere', ok: false, why: 'Two spheres are involved.' },
  ] },
  { emoji: '🪞', title: 'Albedo', story: 'Which surface has the highest albedo?', idea: 'Albedo = share of sunlight reflected', options: [
    { text: 'Fresh snow', ok: true, why: 'It reflects about 80–90% of sunlight.' },
    { text: 'Ocean', ok: false, why: 'Oceans are dark and absorb most light.' },
    { text: 'Forest', ok: false, why: 'Forests are dark green.' },
    { text: 'Tar road', ok: false, why: 'Black surfaces absorb light.' },
  ] },
  { emoji: '🔁', title: 'Feedback', story: 'Why does melting Arctic ice speed up warming?', idea: 'Less white surface', options: [
    { text: 'Dark ocean replaces white ice, absorbing more sunlight', ok: true, why: 'Lower albedo → more warming → more melting.' },
    { text: 'Melted ice releases heat', ok: false, why: 'Melting absorbs heat.' },
    { text: 'Ice makes CO₂', ok: false, why: 'Ice doesn’t produce CO₂.' },
    { text: 'The ocean reflects more than ice', ok: false, why: 'It reflects far less.' },
  ] },
  { emoji: '🌡️', title: 'Greenhouse', story: 'Without any greenhouse effect, Earth’s average temperature would be about…', idea: 'Energy-balance model', options: [
    { text: '−18 °C', ok: true, why: 'The natural greenhouse effect adds about 33 °C.' },
    { text: '15 °C', ok: false, why: 'That is today, with the greenhouse effect.' },
    { text: '50 °C', ok: false, why: 'Far too hot.' },
    { text: '0 °C exactly', ok: false, why: 'It would be well below freezing.' },
  ] },
  { emoji: '☀️', title: 'Uneven heating', story: 'Why is the equator hotter than the poles?', idea: 'Angle of sunlight', options: [
    { text: 'Sunlight hits it more directly, so energy is concentrated on a smaller area', ok: true, why: 'Slanting rays spread out near the poles.' },
    { text: 'The equator is closer to the Sun', ok: false, why: 'The distance difference is tiny.' },
    { text: 'The poles have no sunlight at all', ok: false, why: 'They get sunlight, just slanting.' },
    { text: 'The equator has more greenhouse gas', ok: false, why: 'That isn’t the main reason.' },
  ] },
  { emoji: '🌬️', title: 'Sea breeze', story: 'On a sunny afternoon at the beach, the breeze blows…', idea: 'Land heats faster than sea', options: [
    { text: 'From the sea towards the land', ok: true, why: 'Warm air rises over land; cooler sea air moves in.' },
    { text: 'From the land to the sea', ok: false, why: 'That happens at night.' },
    { text: 'Straight up only', ok: false, why: 'Air moves sideways to replace rising air.' },
    { text: 'Never at the beach', ok: false, why: 'Sea breezes are very common.' },
  ] },
  { emoji: '🌱', title: 'Nitrogen', story: 'How do pea and bean plants help put nitrogen into soil?', idea: 'Root nodules', options: [
    { text: 'Bacteria in their root nodules fix nitrogen from the air', ok: true, why: 'That is why farmers rotate crops with legumes.' },
    { text: 'They absorb nitrogen from sunlight', ok: false, why: 'Sunlight contains no nitrogen.' },
    { text: 'They make nitrogen by photosynthesis', ok: false, why: 'Photosynthesis makes sugar and oxygen.' },
    { text: 'They release nitrogen gas into soil', ok: false, why: 'Fixation turns gas into usable compounds.' },
  ] },
  { emoji: '⚫', title: 'Carbon', story: 'Which process moves carbon from the atmosphere into living things?', idea: 'Plants take in CO₂', options: [
    { text: 'Photosynthesis', ok: true, why: 'Carbon becomes part of sugars.' },
    { text: 'Respiration', ok: false, why: 'That returns CO₂ to the air.' },
    { text: 'Burning fossil fuels', ok: false, why: 'That adds CO₂ to the air.' },
    { text: 'Decomposition', ok: false, why: 'That releases carbon.' },
  ] },
  { emoji: '🌊', title: 'Oceans', story: 'The oceans absorb about a quarter of the CO₂ we emit. What is one side effect?', idea: 'CO₂ + water → carbonic acid', options: [
    { text: 'The oceans become more acidic, harming corals and shellfish', ok: true, why: 'Ocean acidification.' },
    { text: 'The oceans become saltier', ok: false, why: 'Salinity isn’t the main change.' },
    { text: 'The oceans freeze', ok: false, why: 'They are warming, not freezing.' },
    { text: 'Nothing: CO₂ is harmless in water', ok: false, why: 'It forms carbonic acid.' },
  ] },
]

export default function EarthSystemMaster() {
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
      if (!useProgress.getState().badges.includes('earth-system-master')) addXp(25 + hearts * 10, 'Earth System Master!')
      awardBadge('earth-system-master')
    }
  }
  const restart = () => { setRound((r) => r + 1); setI(0); setHearts(3); setPicked(null) }

  return (
    <LabFrame labId="earth-system-master" title="Boss Challenge: Earth System Master" subtitle="Ten problems on Earth’s spheres, energy balance, winds and the cycles of matter." howTo={<p>Choose the right answer. A wrong choice costs a ❤️. Work it out on paper first, then check the explanation.</p>}>
      {done && hearts > 0 && <Confetti />}
      <div className="mb-3 flex items-center justify-between text-lg">
        <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Problem {Math.min(i + 1, problems.length)} / {problems.length}</span>
      </div>
      {done ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🌍</p>
          <p className="mt-2 font-heading text-2xl font-semibold">Earth System Master! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}</p>
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
