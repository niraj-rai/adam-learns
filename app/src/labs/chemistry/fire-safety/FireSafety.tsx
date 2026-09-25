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
type Scenario = { emoji: string; title: string; story: string; options: Option[]; lesson: string }

const SCENARIOS: Scenario[] = [
  {
    emoji: '🍳',
    title: 'Kitchen oil fire',
    story: 'Oil in a kadhai on the gas stove suddenly bursts into flames!',
    options: [
      { text: 'Turn off the gas and cover the kadhai with a lid', ok: true, why: 'Turning off the gas stops the heat, and the lid cuts off oxygen. The fire goes out.' },
      { text: 'Throw a mug of water on it', ok: false, why: 'NEVER! Water sinks under hot oil and instantly boils, blasting burning oil everywhere.' },
      { text: 'Fan it to blow it out', ok: false, why: 'Fanning gives the fire MORE oxygen and makes it bigger.' },
      { text: 'Carry the burning kadhai outside', ok: false, why: 'You could spill burning oil on yourself or spread the fire.' },
    ],
    lesson: 'Oil fires: cut off oxygen (lid, damp cloth, fire blanket). Never use water.',
  },
  {
    emoji: '📺',
    title: 'Electrical fire',
    story: 'Sparks and smoke are coming from behind the TV, and a small flame appears on the wire.',
    options: [
      { text: 'Switch off the main power, then use a CO₂ fire extinguisher', ok: true, why: 'Cutting the power removes the source of heat and the danger of shock. CO₂ smothers the fire without conducting electricity.' },
      { text: 'Pour water on the TV', ok: false, why: 'Water conducts electricity, so you could get a deadly electric shock.' },
      { text: 'Unplug it with wet hands', ok: false, why: 'Wet hands + electricity = serious shock risk. Switch off at the mains.' },
      { text: 'Ignore it, it will stop by itself', ok: false, why: 'Electrical fires can spread quickly through wires and furniture.' },
    ],
    lesson: 'Electrical fires: switch off power first; use a CO₂ or powder extinguisher, never water.',
  },
  {
    emoji: '🗑️',
    title: 'Paper fire in a dustbin',
    story: 'Someone threw a match into a wastepaper basket full of paper. It is burning.',
    options: [
      { text: 'Pour water on it', ok: true, why: 'Water cools the burning paper below its ignition temperature and also cuts off air. Perfect for paper and wood fires.' },
      { text: 'Add more paper to smother it', ok: false, why: 'Paper is fuel! You would make the fire bigger.' },
      { text: 'Open the windows to let smoke out first', ok: false, why: 'Put the fire out first. Extra air feeds the fire.' },
      { text: 'Spray perfume on it', ok: false, why: 'Perfume contains alcohol, a fuel. It would flare up!' },
    ],
    lesson: 'Paper, wood and cloth fires: water works well (it cools and smothers).',
  },
  {
    emoji: '🧥',
    title: 'Clothes on fire',
    story: "During Diwali, a spark from a phuljhadi catches the edge of your cousin's kurta.",
    options: [
      { text: 'Stop, drop and roll, or wrap them in a thick blanket', ok: true, why: 'Rolling and wrapping cut off oxygen from the flames. Then cool the burn with running water.' },
      { text: 'Run to find help', ok: false, why: 'Running fans the flames with fresh air and makes them grow.' },
      { text: 'Wave your arms to blow it out', ok: false, why: 'Moving air gives the fire more oxygen.' },
      { text: 'Apply ghee or butter on the flames', ok: false, why: 'Ghee is a fuel, and it is harmful on burns too.' },
    ],
    lesson: 'Clothes on fire: STOP, DROP and ROLL. Wear cotton clothes near fireworks.',
  },
  {
    emoji: '🛵',
    title: 'Petrol fire',
    story: 'Petrol spilled while filling a scooter and a small fire started on the ground.',
    options: [
      { text: 'Throw sand or use a foam / CO₂ extinguisher', ok: true, why: 'Sand and foam form a blanket that cuts off oxygen. Petrol pumps keep buckets of sand for this reason!' },
      { text: 'Throw water on it', ok: false, why: 'Petrol floats on water, so the burning petrol spreads further on top of it.' },
      { text: 'Stamp on it with your shoes', ok: false, why: 'Dangerous: petrol can splash onto your clothes and set them on fire.' },
      { text: 'Start the scooter and ride away', ok: false, why: 'The engine and hot exhaust could ignite more petrol vapour.' },
    ],
    lesson: 'Petrol and oil fires: sand, foam or CO₂. Never water.',
  },
  {
    emoji: '🛢️',
    title: 'Gas leak (no fire yet!)',
    story: 'You come home and smell LPG gas in the kitchen.',
    options: [
      { text: "Turn off the regulator, open doors and windows, and don't touch any switch", ok: true, why: 'Removing fuel and letting fresh air dilute the gas stops a fire before it starts. A spark from a switch could ignite the gas.' },
      { text: 'Switch on the light to see better', ok: false, why: 'Switching on can make a tiny spark, which could ignite the gas and cause an explosion.' },
      { text: 'Light a match to find the leak', ok: false, why: 'This could cause an explosion!' },
      { text: 'Switch on the exhaust fan', ok: false, why: 'The fan switch and motor can spark. Open windows instead.' },
    ],
    lesson: 'LPG leak: regulator off, windows open, no sparks, call the gas agency. LPG has a smelly chemical added so that you can notice leaks.',
  },
]

export default function FireSafety() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const scenarios = useMemo(() => SCENARIOS.map((s) => ({ ...s, options: shuffle(s.options) })), [round])
  const [i, setI] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [picked, setPicked] = useState<Option | null>(null)

  const s = scenarios[i]
  const won = i >= scenarios.length
  const lost = hearts === 0 && !picked

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
    if (n >= scenarios.length) {
      sfx.win()
      if (!useProgress.getState().badges.includes('fire-officer')) addXp(25 + hearts * 10, 'Fire Safety Officer!')
      awardBadge('fire-officer')
    }
  }

  const restart = () => {
    setRound((r) => r + 1)
    setI(0)
    setHearts(3)
    setPicked(null)
  }

  return (
    <LabFrame labId="fire-safety" title="Boss Challenge: Fire Safety Officer" subtitle="Six emergencies. Use the fire triangle to choose the safe action." howTo={<p>For each emergency, choose the safest action. A wrong choice costs a ❤️. Always ask: which side of the fire triangle can I remove safely?</p>}>
      {won && <Confetti />}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg" aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
        <span className="text-sm text-muted-foreground">Emergency {Math.min(i + 1, scenarios.length)} / {scenarios.length}</span>
      </div>

      {won ? (
        <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-6 text-center">
          <p className="text-5xl">🧑‍🚒</p>
          <p className="mt-2 font-heading text-2xl font-semibold">
            Certified Fire Safety Officer! {'⭐'.repeat(hearts)}{'☆'.repeat(3 - hearts)}
          </p>
          <p className="mt-1 text-sm">Remember: in any real fire, get everyone out safely first and call the fire service on <b>101</b> (or <b>112</b>).</p>
          <Button className="mt-3" variant="outline" onClick={restart}>Play again</Button>
        </div>
      ) : lost ? (
        <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="text-5xl">🧯</p>
          <p className="mt-2 font-heading text-xl font-semibold">Out of lives. Fire safety takes practice!</p>
          <p className="mt-1 text-sm">Tip: never add fuel or oxygen. Never use water on oil, petrol or electrical fires.</p>
          <Button className="mt-3" onClick={restart}>Try again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
            <span className="text-5xl" aria-hidden>{s.emoji}</span>
            <div>
              <p className="font-heading text-xl font-semibold">{s.title}</p>
              <p className="text-[15px]">{s.story}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {s.options.map((o) => (
              <button
                key={o.text}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => choose(o)}
                className={cn(
                  'rounded-xl border-2 bg-background px-4 py-3 text-left text-sm transition',
                  !picked && 'hover:border-chem',
                  picked && o.ok && 'border-success bg-success-soft',
                  picked === o && !o.ok && 'border-destructive/60 bg-destructive/10',
                  picked && picked !== o && !o.ok && 'opacity-50',
                )}
              >
                {o.text}
              </button>
            ))}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl p-4 text-sm', picked.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked.ok ? '✅ ' : '❌ '}{picked.why}</p>
              <p className="mt-2 font-semibold">🧠 {s.lesson}</p>
              {hearts > 0 ? (
                <Button className="mt-3" autoFocus onClick={next}>
                  {i + 1 < scenarios.length ? 'Next emergency →' : 'Finish'}
                </Button>
              ) : (
                <Button className="mt-3" autoFocus variant="outline" onClick={() => setPicked(null)}>
                  See result
                </Button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
