import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Kind = 'linear' | 'circular' | 'oscillatory'
const KINDS: { id: Kind; label: string; desc: string }[] = [
  { id: 'linear', label: 'Linear', desc: 'along a straight line' },
  { id: 'circular', label: 'Circular', desc: 'along a circular path' },
  { id: 'oscillatory', label: 'Oscillatory', desc: 'back and forth about a fixed point' },
]

const SCENES: { emoji: string; name: string; kind: Kind; why: string }[] = [
  { emoji: '🚆', name: 'A train on a straight track', kind: 'linear', why: 'It moves along a straight line.' },
  { emoji: '🎡', name: 'A seat on a giant wheel', kind: 'circular', why: 'The seat follows a circular path around the centre.' },
  { emoji: '🛝', name: 'A child on a swing', kind: 'oscillatory', why: 'The swing moves back and forth about its resting position.' },
  { emoji: '🥭', name: 'A mango falling from a tree', kind: 'linear', why: 'It falls straight down.' },
  { emoji: '🕐', name: 'The tip of a clock’s hand', kind: 'circular', why: 'It goes round and round in a circle.' },
  { emoji: '🎸', name: 'A plucked sitar string', kind: 'oscillatory', why: 'It vibrates back and forth very quickly.' },
  { emoji: '🌍', name: 'The Earth going around the Sun', kind: 'circular', why: 'Its orbit is (nearly) circular, and it repeats every year, so it is periodic too.' },
  { emoji: '💂', name: 'Soldiers marching in a straight line on Republic Day', kind: 'linear', why: 'They move forward along a straight road.' },
  { emoji: '🐝', name: 'The wings of a bee', kind: 'oscillatory', why: 'They beat up and down, back and forth, hundreds of times a second.' },
  { emoji: '🪀', name: 'A see-saw', kind: 'oscillatory', why: 'Each end goes up and down about the middle.' },
  { emoji: '🌀', name: 'A point on a ceiling fan blade', kind: 'circular', why: 'It moves around the centre of the fan.' },
  { emoji: '🏃', name: 'An athlete in a 100 m race', kind: 'linear', why: 'The sprinter runs in a straight lane.' },
]

function Animated({ kind, emoji }: { kind: Kind; emoji: string }) {
  if (kind === 'linear')
    return (
      <motion.span className="absolute top-1/2 text-4xl" style={{ translateY: '-50%' }} animate={{ left: ['5%', '80%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}>
        {emoji}
      </motion.span>
    )
  if (kind === 'circular')
    return (
      <motion.div className="absolute top-1/2 left-1/2 size-24" style={{ translateX: '-50%', translateY: '-50%' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">{emoji}</span>
      </motion.div>
    )
  return (
    <motion.span className="absolute top-1/2 left-1/2 text-4xl" style={{ translateY: '-50%' }} animate={{ x: ['-60px', '40px', '-60px'] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}>
      {emoji}
    </motion.span>
  )
}

export default function MotionSorter() {
  const [round, setRound] = useState(0)
  const deck = useMemo(() => shuffle(SCENES).slice(0, 9), [round])
  const [i, setI] = useState(0)
  const [answer, setAnswer] = useState<Kind | null>(null)
  const [score, setScore] = useState(0)
  const [showMotion, setShowMotion] = useState(false)
  const s = deck[i]
  const done = i >= deck.length

  return (
    <LabFrame labId="motion-sorter" title="Motion Sorter" subtitle="Linear, circular or oscillatory? Watch the motion and decide." howTo={<p>Read the scene, imagine how it moves, then choose. Tap “Show me the motion” if you want a hint.</p>}>
      {done ? (
        <div className="rounded-2xl border bg-chem-soft p-6 text-center">
          <p className="text-5xl">{score >= 8 ? '🏆' : '👏'}</p>
          <p className="mt-2 font-heading text-2xl font-semibold">{score} / {deck.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Motions that repeat after a fixed time (a swing, a clock hand, the Earth's orbit) are also called <b>periodic motion</b>.</p>
          <Button className="mt-3" onClick={() => { setRound((r) => r + 1); setI(0); setScore(0); setAnswer(null) }}>New scenes</Button>
        </div>
      ) : (
        <div className="mx-auto max-w-xl space-y-3">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Scene {i + 1} / {deck.length}</span>
            <span>Score {score}</span>
          </div>
          <div className="relative h-36 overflow-hidden rounded-2xl border bg-background">
            {showMotion || answer ? <Animated kind={s.kind} emoji={s.emoji} /> : <span className="absolute inset-0 grid place-items-center text-6xl">{s.emoji}</span>}
          </div>
          <p className="text-center font-heading text-xl font-semibold">{s.name}</p>
          {!answer && !showMotion && <Button size="sm" variant="ghost" className="mx-auto block" onClick={() => setShowMotion(true)}>👀 Show me the motion</Button>}
          <div className="grid grid-cols-3 gap-2">
            {KINDS.map((k) => (
              <Button
                key={k.id}
                size="lg"
                disabled={Boolean(answer)}
                variant={answer === k.id ? (k.id === s.kind ? 'default' : 'destructive') : 'outline'}
                className="h-auto flex-col py-2"
                onClick={() => { setAnswer(k.id); if (k.id === s.kind) { setScore((x) => x + 1); sfx.correct() } else sfx.wrong() }}
              >
                <span>{k.label}</span>
                <span className="text-[10px] font-normal opacity-70">{k.desc}</span>
              </Button>
            ))}
          </div>
          {answer && (
            <div role="status" className={cn('rounded-xl p-3 text-center text-sm', answer === s.kind ? 'bg-success-soft' : 'bg-warn-soft')}>
              {answer === s.kind ? '✅ ' : `❌ It's ${s.kind}. `}{s.why}
              <Button size="sm" className="mt-2 block w-full" autoFocus onClick={() => { setI((x) => x + 1); setAnswer(null); setShowMotion(false) }}>Next scene →</Button>
            </div>
          )}
        </div>
      )}
    </LabFrame>
  )
}
