import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Dye = { name: string; color: string; rf: number }
const DYES: Record<string, Dye> = {
  blue: { name: 'blue', color: '#2563eb', rf: 0.85 },
  yellow: { name: 'yellow', color: '#eab308', rf: 0.65 },
  red: { name: 'red', color: '#dc2626', rf: 0.45 },
  purple: { name: 'purple', color: '#7c3aed', rf: 0.25 },
}
const SUSPECTS = [
  { name: 'Aarav', dyes: ['blue', 'red'] },
  { name: 'Priya', dyes: ['blue', 'yellow', 'purple'] },
  { name: 'Rohan', dyes: ['yellow', 'red', 'purple'] },
  { name: 'Meera', dyes: ['blue', 'yellow', 'red'] },
]

// strip geometry (SVG units): 20 units = 1 cm
const CM = 20
const STRIP_H = 10 * CM
const BASE = STRIP_H - 1 * CM // pencil line 1 cm above the bottom
const TRAVEL_MAX = 8 // cm the solvent front travels above the pencil line
const RUN_SECONDS = 6

function Strip({ label, dyes, progress }: { label: string; dyes: string[]; progress: number }) {
  const front = progress * TRAVEL_MAX
  const mixedColor = '#1f2937'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox={`0 0 44 ${STRIP_H + 16}`} className="h-64 w-auto" role="img" aria-label={`${label} strip`}>
        <rect x={4} y={0} width={36} height={STRIP_H} fill="#fafaf9" stroke="#d6d3d1" />
        {/* wet part */}
        <rect x={4} y={BASE - front * CM} width={36} height={front * CM + 1 * CM} fill="#bae6fd" opacity={0.45} />
        {progress > 0 && <line x1={4} x2={40} y1={BASE - front * CM} y2={BASE - front * CM} stroke="#0284c7" strokeDasharray="2 2" />}
        {/* pencil line */}
        <line x1={4} x2={40} y1={BASE} y2={BASE} stroke="#78716c" strokeWidth={0.8} />
        {progress === 0 ? (
          <circle cx={22} cy={BASE} r={4} fill={mixedColor} />
        ) : (
          dyes.map((d) => {
            const dye = DYES[d]
            const y = BASE - dye.rf * front * CM
            const spread = 3 + dye.rf * front * 0.8
            return <ellipse key={d} cx={22} cy={y} rx={5} ry={spread} fill={dye.color} opacity={0.8} />
          })
        )}
        {/* solvent */}
        <rect x={0} y={STRIP_H - 0.6 * CM} width={44} height={0.6 * CM + 16} fill="#7dd3fc" opacity={0.6} />
      </svg>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  )
}

export default function Chromatography() {
  const [culprit, setCulprit] = useState(() => Math.floor(Math.random() * SUSPECTS.length))
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [accused, setAccused] = useState<number | null>(null)
  const [rfGuess, setRfGuess] = useState('')
  const [rfChecked, setRfChecked] = useState<boolean | null>(null)
  const raf = useRef(0)

  useEffect(() => {
    if (!running) return
    const start = performance.now() - progress * RUN_SECONDS * 1000
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (RUN_SECONDS * 1000))
      setProgress(p)
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const note = SUSPECTS[culprit].dyes
  const done = progress >= 1
  const measureDye = DYES[note[0]]
  const dyeDistance = Math.round(measureDye.rf * TRAVEL_MAX * 10) / 10

  const newCase = () => {
    setCulprit(Math.floor(Math.random() * SUSPECTS.length))
    setProgress(0)
    setRunning(false)
    setAccused(null)
    setRfGuess('')
    setRfChecked(null)
  }

  return (
    <LabFrame
      labId="chromatography"
      title="Chromatography: The Ink Mystery"
      subtitle="Who wrote the mystery note? Separate the dyes in each black ink to find out."
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>A spot of each black ink sits on a pencil line. Pencil is used because its graphite does not dissolve and run.</li>
          <li>Press <b>Dip in water</b>. As the water soaks up the paper, each dye travels a different distance.</li>
          <li>Compare the pattern from the note with each suspect's pen.</li>
        </ul>
      }
    >
      <p className="mb-3 rounded-xl bg-muted/50 px-4 py-2 text-[15px]">
        🕵️ Someone left an anonymous note on the school notice board saying <i>“The science test is cancelled!”</i> Four students own black pens. Chromatography can
        show whose pen wrote it.
      </p>

      <div className="flex flex-wrap items-end justify-center gap-3 rounded-2xl border bg-background p-4 sm:gap-5">
        <Strip label="📝 Note" dyes={note} progress={progress} />
        <div className="h-56 w-px bg-border" />
        {SUSPECTS.map((s) => (
          <Strip key={s.name} label={s.name} dyes={s.dyes} progress={progress} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="lg" onClick={() => setRunning(true)} disabled={running || done}>
          💧 Dip in water
        </Button>
        <Button size="lg" variant="ghost" onClick={newCase}>
          New case
        </Button>
        {running && <span className="self-center text-sm text-muted-foreground">The water is soaking up the paper…</span>}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-4">
          <div className="rounded-xl border bg-chem-soft p-4">
            <p className="font-semibold">Whose pen matches the note?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUSPECTS.map((s, i) => (
                <Button
                  key={s.name}
                  variant={accused === i ? (i === culprit ? 'default' : 'destructive') : 'outline'}
                  disabled={accused !== null}
                  onClick={() => {
                    setAccused(i)
                    ;(i === culprit ? sfx.win : sfx.wrong)()
                  }}
                >
                  {s.name}
                </Button>
              ))}
            </div>
            {accused !== null && (
              <p className="mt-2 text-sm" role="status">
                {accused === culprit ? '🎯 Case solved! ' : `❌ Not ${SUSPECTS[accused].name}. `}
                It was <b>{SUSPECTS[culprit].name}</b>: the note's ink separates into exactly the same dyes ({note.join(', ')}), at the same heights. Black ink is
                a <b>mixture</b> of coloured dyes!
              </p>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <p className="font-semibold">Measure it: the R<sub>f</sub> value</p>
            <p className="mt-1 text-sm text-muted-foreground">
              On the note's strip, the solvent front moved <b>{TRAVEL_MAX} cm</b> from the pencil line and the {measureDye.name} dye moved <b>{dyeDistance} cm</b>.
            </p>
            <p className="mt-1 text-sm">
              R<sub>f</sub> = distance moved by the dye ÷ distance moved by the solvent
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                value={rfGuess}
                onChange={(e) => {
                  setRfGuess(e.target.value)
                  setRfChecked(null)
                }}
                inputMode="decimal"
                placeholder="0.00"
                className="h-9 w-24 rounded-lg border bg-background px-3 text-sm"
                aria-label="Your Rf value"
              />
              <Button variant="outline" disabled={!rfGuess} onClick={() => setRfChecked(Math.abs(Number(rfGuess) - measureDye.rf) < 0.02)}>
                Check
              </Button>
              {rfChecked === true && <span className="text-sm text-success">✅ {dyeDistance} ÷ {TRAVEL_MAX} = {measureDye.rf.toFixed(2)}</span>}
              {rfChecked === false && <span className="text-sm text-destructive">Try again: divide {dyeDistance} by {TRAVEL_MAX}.</span>}
            </div>
            <p className={cn('mt-2 text-xs text-muted-foreground')}>An R<sub>f</sub> value is always between 0 and 1. The same dye in the same solvent always gives the same R<sub>f</sub>. That is how scientists identify it.</p>
          </div>
        </motion.div>
      )}
    </LabFrame>
  )
}
