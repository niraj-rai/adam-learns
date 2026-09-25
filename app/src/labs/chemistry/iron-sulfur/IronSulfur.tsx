import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { seeded } from '../particle-zoom/samples'
import { LabFrame } from '../../_kit/LabFrame'

type Stage = 'separate' | 'mixed' | 'magnet-mixed' | 'heated' | 'magnet-heated'

const W = 320
const H = 170

export default function IronSulfur() {
  const [stage, setStage] = useState<Stage>('separate')
  const [log, setLog] = useState<string[]>([])

  const specks = useMemo(() => {
    const r = seeded(42)
    return Array.from({ length: 90 }, (_, i) => ({ iron: i % 2 === 0, x: 70 + r() * 180, y: 95 + r() * 45, s: 2.5 + r() * 2 }))
  }, [])

  const add = (s: string) => setLog((l) => [...l, s])
  const mixed = stage === 'mixed' || stage === 'magnet-mixed'
  const heated = stage === 'heated' || stage === 'magnet-heated'

  return (
    <LabFrame
      labId="iron-sulfur"
      title="Iron + Sulfur: Mixture or Compound?"
      subtitle="Mix them, try a magnet, then heat them"
      howTo={<p>Follow the buttons in order. Watch what the magnet does before and after heating.</p>}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border bg-muted/40" role="img" aria-label={`Iron and sulfur: ${stage}`}>
          {/* magnet */}
          {(stage === 'magnet-mixed' || stage === 'magnet-heated') && (
            <g transform="translate(135 10)">
              <path d="M0 0 h50 v40 h-14 v-26 h-22 v26 h-14 z" fill="#dc2626" />
              <rect x={0} y={34} width={14} height={8} fill="#cbd5e1" />
              <rect x={36} y={34} width={14} height={8} fill="#cbd5e1" />
            </g>
          )}
          {/* dish */}
          <ellipse cx={160} cy={140} rx={120} ry={22} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={3} />
          {stage === 'separate' && (
            <>
              <ellipse cx={100} cy={128} rx={42} ry={12} fill="#6b7280" />
              <text x={100} y={105} textAnchor="middle" fontSize={11} className="fill-foreground">iron filings</text>
              <ellipse cx={220} cy={128} rx={42} ry={12} fill="#facc15" />
              <text x={220} y={105} textAnchor="middle" fontSize={11} className="fill-foreground">sulfur powder</text>
            </>
          )}
          {mixed &&
            specks.map((s, i) => {
              const toMagnet = stage === 'magnet-mixed' && s.iron
              return (
                <motion.circle
                  key={i}
                  r={s.s}
                  fill={s.iron ? '#4b5563' : '#facc15'}
                  initial={false}
                  animate={{ cx: toMagnet ? 142 + (i % 7) * 6 : s.x, cy: toMagnet ? 56 + (i % 3) * 4 : s.y }}
                  transition={{ type: 'spring', stiffness: 60, damping: 12, delay: toMagnet ? (i % 10) * 0.03 : 0 }}
                />
              )
            })}
          {heated && (
            <>
              <motion.ellipse cx={160} cy={126} rx={70} ry={16} fill="#111827" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              <motion.ellipse cx={160} cy={126} rx={70} ry={16} fill="#f97316" initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} transition={{ duration: 2 }} />
              <text x={160} y={96} textAnchor="middle" fontSize={11} className="fill-foreground">iron sulfide (a new substance)</text>
            </>
          )}
        </svg>

        <div className="space-y-2">
          <Button
            className="w-full justify-start"
            variant="outline"
            disabled={stage !== 'separate'}
            onClick={() => {
              setStage('mixed')
              add('🥄 Mixed iron and sulfur. You can still see grey and yellow bits: nothing new formed.')
            }}
          >
            1. Mix them together
          </Button>
          <Button
            className="w-full justify-start"
            variant="outline"
            disabled={!(stage === 'mixed' || stage === 'heated')}
            onClick={() => {
              if (stage === 'mixed') {
                setStage('magnet-mixed')
                add('🧲 Magnet on the MIXTURE: the iron jumps out! Each substance keeps its own properties, so a mixture is easy to separate.')
              } else {
                setStage('magnet-heated')
                add('🧲 Magnet on the product: nothing moves. Iron sulfide is a new substance with NEW properties. It is not magnetic.')
              }
            }}
          >
            2. Bring a magnet close
          </Button>
          <Button
            className="w-full justify-start"
            variant="outline"
            disabled={!(stage === 'mixed' || stage === 'magnet-mixed')}
            onClick={() => {
              setStage('heated')
              add('🔥 Heated the mixture strongly: it GLOWED red-hot (energy given out) and turned into a black solid, iron sulfide. A chemical reaction made a compound.')
            }}
          >
            3. Heat the mixture strongly
          </Button>
          <Button className="w-full" variant="ghost" onClick={() => { setStage('separate'); setLog([]) }}>
            Start again
          </Button>
          <p className="rounded-lg bg-warn-soft px-3 py-2 text-xs">⚠️ In a real lab, only a teacher heats iron and sulfur, in a fume cupboard: it can release a harmful gas.</p>
        </div>
      </div>

      {log.length > 0 && (
        <ol className="mt-4 space-y-1.5 text-sm" aria-live="polite">
          {log.map((l, i) => (
            <li key={i} className="rounded-lg border bg-background px-3 py-2">{l}</li>
          ))}
        </ol>
      )}

      {stage === 'magnet-heated' && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr><th className="py-1 pr-3" /><th className="py-1 pr-3">Mixture (iron + sulfur)</th><th className="py-1">Compound (iron sulfide)</th></tr>
            </thead>
            <tbody>
              <tr className="border-t"><td className="py-1.5 pr-3 font-semibold">Looks like</td><td className="pr-3">grey and yellow bits</td><td>one black solid</td></tr>
              <tr className="border-t"><td className="py-1.5 pr-3 font-semibold">Magnet</td><td className="pr-3">pulls out the iron</td><td>no effect</td></tr>
              <tr className="border-t"><td className="py-1.5 pr-3 font-semibold">Energy</td><td className="pr-3">no change when mixed</td><td>heat and light given out</td></tr>
              <tr className="border-t"><td className="py-1.5 pr-3 font-semibold">Amounts</td><td className="pr-3">any amounts</td><td>fixed ratio (7 g iron : 4 g sulfur)</td></tr>
              <tr className="border-t"><td className="py-1.5 pr-3 font-semibold">Separate by</td><td className="pr-3">physical methods (magnet)</td><td>only by chemical reactions</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </LabFrame>
  )
}
