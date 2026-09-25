import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'

type Problem = 'leaves' | 'mud' | 'fine' | 'germs'
const ORDER: Problem[] = ['leaves', 'mud', 'fine', 'germs']

type Treatment = { id: string; name: string; emoji: string; fixes?: Problem; success?: string; wrong: (current: Problem) => string }

const earlyMsg: Record<Problem, string> = {
  leaves: 'First deal with the leaves, twigs and plastic floating on top. They would get in the way of every other step.',
  mud: 'The water is still very muddy. That thick mud would clog a filter, and germs can hide inside the dirt. Remove it first.',
  fine: 'The water is still a bit cloudy with fine particles. Germ-killing works best on clear water.',
  germs: '',
}

const TREATMENTS: Treatment[] = [
  { id: 'screen', name: 'Strain through a cloth / wire screen', emoji: '🥅', fixes: 'leaves', success: 'Screening removed the leaves, twigs and plastic. Big floating things are trapped by the mesh.', wrong: () => 'There is nothing big left to strain out.' },
  { id: 'alum', name: 'Add alum (phitkari), let settle, then decant', emoji: '🧂', fixes: 'mud', success: 'Alum makes the tiny mud particles clump together (loading). They sank to the bottom (sedimentation) and you poured off the clearer water (decantation).', wrong: (c) => earlyMsg[c] },
  { id: 'sand', name: 'Pour through a sand & gravel filter', emoji: '⏳', fixes: 'fine', success: 'Layers of gravel, coarse sand and fine sand trapped the small particles. The water now looks crystal clear!', wrong: (c) => earlyMsg[c] },
  { id: 'chlorine', name: 'Add chlorine tablets (or boil it)', emoji: '💊', fixes: 'germs', success: 'Chlorine (or boiling for several minutes) killed the harmful germs. The water is now safe to drink!', wrong: (c) => earlyMsg[c] },
  { id: 'drink', name: 'It looks clear, so just drink it!', emoji: '🥤', wrong: (c) => (c === 'germs' ? 'Careful! Clear water can still contain germs that you can’t see, and those germs cause diseases like cholera and typhoid.' : 'Definitely not! This water is not safe yet.') },
  { id: 'evaporate', name: 'Evaporate all the water', emoji: '🔥', wrong: () => 'Evaporating would leave the dirt behind, but the water would be gone into the air! The village needs the water.' },
  { id: 'magnet', name: 'Stir with a strong magnet', emoji: '🧲', wrong: () => 'Mud, leaves and germs are not magnetic. The magnet does nothing here.' },
  { id: 'sugar', name: 'Add sugar to improve the taste', emoji: '🍬', wrong: () => 'Sugar dissolves and makes the water sweet, but not one bit cleaner or safer.' },
]

const LOOK: Record<number, { color: string; label: string }> = {
  0: { color: '#78350f', label: 'Brown, with leaves floating' },
  1: { color: '#92400e', label: 'Brown and muddy' },
  2: { color: '#a8a29e', label: 'Slightly cloudy' },
  3: { color: '#7dd3fc', label: 'Clear (but is it safe?)' },
  4: { color: '#38bdf8', label: 'Clear and safe to drink' },
}

export default function VillageWell() {
  const awardBadge = useProgress((s) => s.awardBadge)
  const addXp = useProgress((s) => s.addXp)
  const [stage, setStage] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [tested, setTested] = useState(false)
  const [used, setUsed] = useState<string[]>([])

  const won = stage === ORDER.length
  const lost = hearts === 0
  const current = ORDER[stage]
  const look = LOOK[stage]

  const choose = (t: Treatment) => {
    if (won || lost) return
    if (t.fixes === current) {
      sfx.correct()
      const next = stage + 1
      setStage(next)
      setUsed((u) => [...u, t.id])
      setMessage({ ok: true, text: t.success! })
      if (next === ORDER.length) {
        sfx.win()
        // XP only on the first rescue, so replaying can't farm points
        if (!useProgress.getState().badges.includes('well-rescuer')) addXp(25 + hearts * 10, 'Village well rescued!')
        awardBadge('well-rescuer')
      }
    } else {
      sfx.wrong()
      setHearts((h) => h - 1)
      setMessage({ ok: false, text: t.wrong(current) })
    }
  }

  const restart = () => {
    setStage(0)
    setHearts(3)
    setMessage(null)
    setTested(false)
    setUsed([])
  }

  return (
    <LabFrame
      labId="village-well"
      title="Boss Challenge: Rescue the Village Well"
      subtitle="Make dirty well water safe to drink, in the right order"
      howTo={<p>Choose treatments one at a time. A wrong choice costs a ❤️. Think about what must be removed first, and why!</p>}
    >
      {won && <Confetti />}
      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-[15px]">
        🏡 After a heavy monsoon storm, the well in a small village near Kolar is full of dirty water. The families need safe drinking water by evening. You are the village scientist!
      </p>

      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-lg">
            <span aria-label={`${hearts} lives left`}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</span>
            <span className="text-sm text-muted-foreground">Step {Math.min(stage + 1, 4)} / 4</span>
          </div>
          <svg viewBox="0 0 200 200" className="w-full rounded-xl border bg-background" role="img" aria-label={`Water sample: ${look.label}`}>
            <path d="M40 30 L55 185 H145 L160 30" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={3} />
            <motion.path d="M44 60 L56 182 H144 L156 60 Z" animate={{ fill: look.color }} transition={{ duration: 1 }} opacity={0.75} />
            <AnimatePresence>
              {stage === 0 &&
                ['🍂', '🌿', '🥤', '🍂'].map((e, i) => (
                  <motion.text key={i} x={60 + i * 25} y={64} fontSize={16} exit={{ opacity: 0, y: -30 }}>
                    {e}
                  </motion.text>
                ))}
              {tested && stage < 4 &&
                [0, 1, 2, 3, 4].map((i) => (
                  <motion.text key={`g${i}`} x={65 + ((i * 29) % 70)} y={100 + ((i * 37) % 70)} fontSize={14} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0 }}>
                    🦠
                  </motion.text>
                ))}
            </AnimatePresence>
            {stage >= 1 && stage < 4 && <rect x={57} y={172} width={86} height={9} fill="#78350f" opacity={0.25} />}
          </svg>
          <p className="text-center text-sm font-semibold">{look.label}</p>
          <Button variant="outline" size="sm" className="w-full" disabled={tested || won} onClick={() => setTested(true)}>
            🔬 Test a drop under a microscope
          </Button>
          {tested && !won && <p className="text-xs text-muted-foreground">🦠 Germs found! You can't see them without a microscope.</p>}
        </div>

        <div className="space-y-3">
          {!won && !lost && (
            <div className="grid gap-2 sm:grid-cols-2">
              {TREATMENTS.filter((t) => !used.includes(t.id)).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => choose(t)}
                  className="flex items-center gap-3 rounded-xl border-2 bg-background px-3 py-2.5 text-left text-sm transition hover:border-chem"
                >
                  <span className="text-2xl" aria-hidden>{t.emoji}</span>
                  {t.name}
                </button>
              ))}
            </div>
          )}

          {message && (
            <motion.p key={message.text} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('rounded-xl px-4 py-3 text-sm', message.ok ? 'bg-success-soft' : 'bg-warn-soft')}>
              {message.ok ? '✅ ' : '❌ '}
              {message.text}
            </motion.p>
          )}

          {won && (
            <div className="rounded-2xl border-2 border-success/50 bg-success-soft p-5 text-center">
              <p className="text-5xl">🎉</p>
              <p className="mt-2 font-heading text-2xl font-semibold">
                Village saved! {'⭐'.repeat(hearts)}
                {'☆'.repeat(3 - hearts)}
              </p>
              <p className="mt-1 text-sm">
                You used the same steps as a real water treatment plant: <b>screening → sedimentation with alum → filtration → disinfection</b>. Bengaluru's water from the Kaveri
                goes through these steps too!
              </p>
              <Button className="mt-3" variant="outline" onClick={restart}>
                Play again
              </Button>
            </div>
          )}
          {lost && (
            <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5 text-center">
              <p className="text-5xl">💧</p>
              <p className="mt-2 font-heading text-xl font-semibold">Out of lives, but every scientist learns from mistakes!</p>
              <p className="mt-1 text-sm">Hint: remove the <b>biggest</b> things first and the <b>smallest</b> things (germs) last.</p>
              <Button className="mt-3" onClick={restart}>
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
