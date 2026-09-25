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
type Job = { emoji: string; title: string; brief: string; options: Option[] }

const JOBS: Job[] = [
  {
    emoji: '🔌',
    title: 'Electrical wiring for a new flat',
    brief: 'Needs to carry electricity well, bend into long thin wires, and be affordable.',
    options: [
      { text: 'Copper', ok: true, why: 'Copper is an excellent conductor, very ductile (drawn into wires) and much cheaper than silver.' },
      { text: 'Silver', ok: false, why: 'Silver conducts even better, but it is far too expensive for house wiring.' },
      { text: 'Iron', ok: false, why: 'Iron conducts poorly compared with copper and it rusts.' },
      { text: 'PVC plastic', ok: false, why: 'PVC is an insulator. It is used to COVER wires, not to carry the current.' },
    ],
  },
  {
    emoji: '✈️',
    title: 'The body of a passenger aeroplane',
    brief: 'Must be strong, very light and must not corrode at high altitude.',
    options: [
      { text: 'Aluminium alloy', ok: true, why: 'Aluminium alloys are light, strong and resist corrosion because of a protective oxide layer.' },
      { text: 'Iron', ok: false, why: 'Iron is heavy and rusts.' },
      { text: 'Pure gold', ok: false, why: 'Gold is very heavy, soft and incredibly expensive.' },
      { text: 'Glass', ok: false, why: 'Glass is brittle and would shatter.' },
    ],
  },
  {
    emoji: '💍',
    title: 'A wedding necklace',
    brief: 'Must stay shiny for generations and be hard enough not to bend out of shape.',
    options: [
      { text: '22-carat gold (gold with a little copper/silver)', ok: true, why: 'Gold never tarnishes, and adding a little copper or silver makes it harder than 24-carat gold.' },
      { text: '24-carat (pure) gold', ok: false, why: 'Pure gold is so soft that fine jewellery bends and scratches easily.' },
      { text: 'Iron', ok: false, why: 'Iron would rust and turn brown.' },
      { text: 'Copper', ok: false, why: 'Copper slowly turns green-black in air.' },
    ],
  },
  {
    emoji: '🍳',
    title: 'Handle of a pressure cooker',
    brief: 'Must not get hot or soften when the cooker is on the flame.',
    options: [
      { text: 'Bakelite (a thermosetting plastic)', ok: true, why: 'Bakelite is a poor conductor of heat and does not soften when heated, because it is thermosetting.' },
      { text: 'Polythene (a thermoplastic)', ok: false, why: 'Thermoplastics soften and melt when heated.' },
      { text: 'Aluminium', ok: false, why: 'Aluminium conducts heat, so the handle would burn your hand.' },
      { text: 'Copper', ok: false, why: 'Copper is an excellent conductor of heat: ouch!' },
    ],
  },
  {
    emoji: '🌉',
    title: 'Cables of a suspension bridge',
    brief: 'Must be extremely strong under tension, and affordable in huge amounts.',
    options: [
      { text: 'Steel (iron + a little carbon), protected with zinc and paint', ok: true, why: 'Steel is very strong and cheap; galvanising and paint protect it from rust.' },
      { text: 'Pure iron', ok: false, why: 'Pure iron is softer than steel and rusts quickly.' },
      { text: 'Nylon rope', ok: false, why: 'Nylon is strong for its weight but stretches too much and weakens in sunlight.' },
      { text: 'Lead', ok: false, why: 'Lead is soft, heavy and toxic.' },
    ],
  },
  {
    emoji: '🍫',
    title: 'Wrapper for a chocolate bar',
    brief: 'Must be thin, flexible, keep out moisture and air, and be safe with food.',
    options: [
      { text: 'Aluminium foil', ok: true, why: 'Aluminium is very malleable (rolled into thin foil), non-toxic, and keeps out air and moisture.' },
      { text: 'Copper sheet', ok: false, why: 'Copper is too expensive and can react with food.' },
      { text: 'Sulfur sheet', ok: false, why: 'Sulfur is brittle and cannot be made into sheets.' },
      { text: 'Iron sheet', ok: false, why: 'Iron is too stiff, heavy, and rusts.' },
    ],
  },
]

export default function MaterialsEngineer() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [round, setRound] = useState(0)
  const jobs = useMemo(() => JOBS.map((j) => ({ ...j, options: shuffle(j.options) })), [round])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<Option | null>(null)
  const [score, setScore] = useState(0)
  const done = i >= jobs.length
  const j = jobs[i]
  const stars = score >= 6 ? 3 : score >= 4 ? 2 : 1

  const choose = (o: Option) => {
    if (picked) return
    setPicked(o)
    if (o.ok) {
      setScore((s) => s + 1)
      sfx.correct()
    } else sfx.wrong()
  }
  const next = () => {
    const n = i + 1
    setI(n)
    setPicked(null)
    if (n >= jobs.length) {
      sfx.win()
      if (score >= 4) {
        if (!useProgress.getState().badges.includes('materials-engineer')) addXp(40, 'Materials Engineer!')
        awardBadge('materials-engineer')
      }
    }
  }

  return (
    <LabFrame labId="materials-engineer" title="Boss Challenge: Materials Engineer" subtitle="Six real jobs. Choose the best material for each and justify it with properties." howTo={<p>Read each design brief and pick the best material. Get at least 4 right to earn the Materials Engineer badge.</p>}>
      {done && score >= 4 && <Confetti />}
      {done ? (
        <div className={cn('rounded-2xl border-2 p-6 text-center', score >= 4 ? 'border-success/50 bg-success-soft' : 'border-warn/50 bg-warn-soft')}>
          <p className="text-5xl">👷</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{score} / {jobs.length} designs approved {score >= 4 && '⭐'.repeat(stars)}</p>
          <p className="mt-1 text-sm">Engineers choose materials by matching <b>properties</b> (conductivity, strength, density, reactivity, cost) to the <b>job</b>.</p>
          <Button className="mt-3" variant="outline" onClick={() => { setRound((r) => r + 1); setI(0); setScore(0); setPicked(null) }}>Play again</Button>
        </div>
      ) : (
        <motion.div key={`${round}-${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Job {i + 1} / {jobs.length}</span>
            <span>Approved: <b className="text-foreground">{score}</b></span>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4">
            <span className="text-5xl" aria-hidden>{j.emoji}</span>
            <div>
              <p className="font-heading text-xl font-semibold">{j.title}</p>
              <p className="text-[15px]">📋 {j.brief}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {j.options.map((o) => (
              <button key={o.text} type="button" disabled={Boolean(picked)} onClick={() => choose(o)} className={cn('rounded-xl border-2 bg-background px-4 py-3 text-left text-sm', !picked && 'hover:border-chem', picked && o.ok && 'border-success bg-success-soft', picked === o && !o.ok && 'border-destructive/60 bg-destructive/10', picked && picked !== o && !o.ok && 'opacity-50')}>
                {o.text}
              </button>
            ))}
          </div>
          {picked && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl p-4 text-sm', picked.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p>{picked.ok ? '✅ Approved! ' : '❌ Rejected. '}{picked.why}</p>
              {!picked.ok && <p className="mt-1">Best choice: <b>{j.options.find((o) => o.ok)!.text}</b>: {j.options.find((o) => o.ok)!.why}</p>}
              <Button className="mt-3" autoFocus onClick={next}>{i + 1 < jobs.length ? 'Next job →' : 'See results'}</Button>
            </motion.div>
          )}
        </motion.div>
      )}
    </LabFrame>
  )
}
