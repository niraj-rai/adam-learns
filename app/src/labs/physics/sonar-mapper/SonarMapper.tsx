import { motion } from 'motion/react'
import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { playNote } from '../../_kit/audio'
import { LabFrame } from '../../_kit/LabFrame'
import { closeEnough, depthFrom, echoTime, SEABED, V_SEA, WRECK } from './model'

const MANUAL = 4 // pings Adam must calculate himself before the ship's computer takes over
const X0 = 30
const DX = 38
const SEA_TOP = 40
const SCALE = 0.55 // px per metre

export default function SonarMapper() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [mapped, setMapped] = useState<number[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [answer, setAnswer] = useState('')
  const [lives, setLives] = useState(3)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [phase, setPhase] = useState<'map' | 'find' | 'won' | 'lost'>('map')
  const [ping, setPing] = useState(0)

  const t = active === null ? 0 : Number(echoTime(SEABED[active]).toFixed(3))
  const loseLife = (msg: string) => {
    sfx.wrong()
    setFeedback(msg)
    setLives((l) => {
      if (l - 1 <= 0) setPhase('lost')
      return l - 1
    })
  }

  const sendPing = (i: number) => {
    if (phase !== 'map' || mapped.includes(i)) return
    setActive(i)
    setAnswer('')
    setFeedback(null)
    setPing((p) => p + 1)
    playNote(1200, { duration: 0.15, volume: 0.15, overtone: 0 })
    window.setTimeout(() => playNote(1200, { duration: 0.15, volume: 0.05, overtone: 0 }), 600)
  }
  const check = () => {
    if (active === null) return
    const d = SEABED[active]
    if (closeEnough(Number(answer), d)) {
      sfx.correct()
      const next = [...mapped, active]
      setFeedback(`✅ ${V_SEA} × ${t} ÷ 2 = ${depthFrom(t).toFixed(0)} m. Mapped!`)
      if (next.length >= MANUAL) {
        setMapped(SEABED.map((_, i) => i))
        setFeedback('✅ Great calculating, Captain! The ship’s computer has mapped the rest of the line. Now: where is the shipwreck?')
        setPhase('find')
      } else setMapped(next)
      setActive(null)
    } else {
      loseLife(`❌ Not quite. Remember the sound goes down AND back up: depth = speed × time ÷ 2.`)
    }
  }
  const guessWreck = (i: number) => {
    if (phase !== 'find') return
    if (i === WRECK) {
      sfx.win()
      setPhase('won')
      setFeedback('🏆 Found it! The seabed suddenly rises to 142 m and drops again: something sits on the bottom. Divers confirm: a sunken cargo ship!')
      if (!useProgress.getState().badges.includes('sonar-captain')) addXp(25 + lives * 10, 'Sonar Captain!')
      awardBadge('sonar-captain')
    } else loseLife('❌ The seabed there follows the natural slope. Look for a spot that is shallower than both its neighbours.')
  }
  const restart = () => { setMapped([]); setActive(null); setLives(3); setFeedback(null); setPhase('map'); setAnswer('') }

  return (
    <LabFrame labId="sonar-mapper" title="Boss Challenge: Sonar Mapper" subtitle="Use echoes to map the seabed off the Konkan coast and find a lost shipwreck." howTo={<p>Tap a position to send a sonar ping. You'll get the time the echo takes to return. Sound travels at {V_SEA} m/s in sea water: calculate the depth. After {MANUAL} correct depths, the ship's computer maps the rest. Then spot the wreck! You have 3 lives.</p>}>
      {phase === 'won' && <Confetti count={80} />}
      <div className="mb-2 flex items-center justify-between text-lg">
        <span aria-label={`${lives} lives left`}>{'❤️'.repeat(Math.max(0, lives))}{'🤍'.repeat(3 - Math.max(0, lives))}</span>
        <span className="text-sm text-muted-foreground">{phase === 'map' ? `Depths calculated: ${mapped.length} / ${MANUAL}` : phase === 'find' ? 'Tap the position of the wreck' : ''}</span>
      </div>
      <svg viewBox="0 0 420 200" className="w-full rounded-2xl border bg-sky-900" role="img" aria-label={`Seabed survey: ${mapped.length} positions mapped`}>
        <rect x={0} y={0} width={420} height={SEA_TOP} fill="#bae6fd" />
        <rect x={0} y={SEA_TOP} width={420} height={160} fill="#0c4a6e" />
        {phase !== 'map' || mapped.length ? (
          <polyline points={SEABED.map((d, i) => (mapped.includes(i) ? `${X0 + i * DX},${SEA_TOP + d * SCALE}` : null)).filter(Boolean).join(' ')} fill="none" stroke="#fbbf24" strokeWidth={2} />
        ) : null}
        {SEABED.map((d, i) => {
          const x = X0 + i * DX
          const known = mapped.includes(i)
          return (
            <g key={i} onClick={() => (phase === 'map' ? sendPing(i) : guessWreck(i))} className="cursor-pointer">
              <rect x={x - DX / 2} y={0} width={DX} height={200} fill="transparent" />
              <text x={x} y={30} fontSize={16} textAnchor="middle" opacity={active === i ? 1 : 0.35}>🚢</text>
              {known ? <rect x={x - 4} y={SEA_TOP + d * SCALE} width={8} height={200} fill="#a16207" /> : <text x={x} y={170} fontSize={12} textAnchor="middle" fill="#7dd3fc">?</text>}
              {known && <text x={x} y={SEA_TOP + d * SCALE - 4} fontSize={8} textAnchor="middle" fill="#fde68a">{d}</text>}
              {phase === 'won' && i === WRECK && <text x={x} y={SEA_TOP + d * SCALE - 12} fontSize={14} textAnchor="middle">⚓</text>}
            </g>
          )
        })}
        {active !== null && (
          <motion.circle key={ping} cx={X0 + active * DX} cy={SEA_TOP} r={4} fill="#fde68a" initial={{ cy: SEA_TOP, opacity: 1 }} animate={{ cy: [SEA_TOP, SEA_TOP + SEABED[active] * SCALE, SEA_TOP], opacity: [1, 1, 0.3] }} transition={{ duration: 1.2, ease: 'linear' }} />
        )}
      </svg>

      {phase === 'map' && active !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm">
          <span>📡 Echo returned after <b>{t} s</b>. Depth =</span>
          <input type="number" inputMode="decimal" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && answer && check()} aria-label="Depth in metres" className="w-24 rounded-md border bg-background px-2 py-1" autoFocus />
          <span>m</span>
          <Button size="sm" onClick={check} disabled={!answer}>Check</Button>
        </div>
      )}
      {phase === 'map' && active === null && !feedback && <p className="mt-3 text-sm text-muted-foreground">Tap any “?” position to send a ping.</p>}
      {feedback && <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', feedback.startsWith('❌') ? 'bg-warn-soft' : 'bg-success-soft')}>{feedback}</p>}
      {(phase === 'lost' || phase === 'won') && (
        <div className="mt-3 flex items-center gap-2">
          {phase === 'lost' && <p className="text-sm">Out of lives! Try again: depth = speed × time ÷ 2.</p>}
          <Button variant="outline" onClick={restart}>↺ Play again</Button>
        </div>
      )}
      <p className="mt-3 text-xs text-muted-foreground">Real ships use SONAR (Sound Navigation And Ranging) to map the ocean floor, find fish and locate wrecks. Bats and dolphins use the same trick, called echolocation.</p>
    </LabFrame>
  )
}
