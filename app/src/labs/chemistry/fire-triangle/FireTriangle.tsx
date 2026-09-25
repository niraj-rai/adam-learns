import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Side = 'fuel' | 'heat' | 'oxygen'
const SIDES: Record<Side, { label: string; emoji: string; remove: string; how: string }> = {
  fuel: { label: 'Fuel', emoji: '🪵', remove: 'Take away the fuel', how: 'Removing the wood leaves nothing left to burn. (Firefighters clear dry grass to stop forest fires spreading.)' },
  heat: { label: 'Heat', emoji: '🌡️', remove: 'Pour water on it', how: 'Water cools the fuel below its ignition temperature, so it stops burning.' },
  oxygen: { label: 'Oxygen', emoji: '🌬️', remove: 'Cover it with sand / a lid', how: 'Sand or a lid cuts off the supply of oxygen (air). No oxygen, no fire.' },
}

function Flame({ size }: { size: number }) {
  return (
    <motion.g animate={{ scaleY: [1, 1.08, 0.96, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} style={{ originX: '100px', originY: '150px' }}>
      <path d={`M100 ${150 - 90 * size} C${70 - 10 * size} ${130 - 30 * size} 80 150 100 150 C120 150 ${130 + 10 * size} ${130 - 30 * size} 100 ${150 - 90 * size} Z`} fill="#f97316" />
      <path d={`M100 ${150 - 55 * size} C85 ${140 - 20 * size} 90 150 100 150 C110 150 115 ${140 - 20 * size} 100 ${150 - 55 * size} Z`} fill="#fde047" />
    </motion.g>
  )
}

export default function FireTriangle() {
  const [removed, setRemoved] = useState<Side | null>(null)
  const burning = removed === null

  // candle-in-a-jar experiment
  const [jar, setJar] = useState<'none' | 'small' | 'large'>('none')
  const [candleT, setCandleT] = useState(0)
  const [candleOut, setCandleOut] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const lifetime = jar === 'small' ? 6 : jar === 'large' ? 14 : Infinity

  useEffect(() => {
    if (timer.current) clearInterval(timer.current)
    setCandleT(0)
    setCandleOut(false)
    if (jar === 'none') return
    timer.current = setInterval(() => {
      setCandleT((t) => {
        const next = Math.round((t + 0.1) * 10) / 10
        if (next >= lifetime) {
          setCandleOut(true)
          if (timer.current) clearInterval(timer.current)
        }
        return next
      })
    }, 100)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [jar, lifetime])

  const flameSize = jar === 'none' ? 1 : Math.max(0.15, 1 - candleT / lifetime)

  return (
    <LabFrame
      labId="fire-triangle"
      title="The Fire Triangle"
      subtitle="Fire needs fuel, heat and oxygen. Take one away and it goes out."
      howTo={<p>Try each way of putting out the campfire. Then do the candle-in-a-jar experiment: does a bigger jar make a difference?</p>}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-background p-3">
          <svg viewBox="0 0 200 190" className="mx-auto w-full max-w-[260px]" role="img" aria-label={burning ? 'Campfire burning' : `Fire out: ${SIDES[removed!].label} removed`}>
            {/* triangle */}
            <polygon points="100,12 12,180 188,180" fill="none" stroke="#e2e8f0" strokeWidth={10} strokeLinejoin="round" />
            <line x1={100} y1={12} x2={12} y2={180} stroke={removed === 'fuel' ? '#e5e7eb' : '#a16207'} strokeWidth={8} strokeLinecap="round" />
            <line x1={100} y1={12} x2={188} y2={180} stroke={removed === 'oxygen' ? '#e5e7eb' : '#0ea5e9'} strokeWidth={8} strokeLinecap="round" />
            <line x1={12} y1={180} x2={188} y2={180} stroke={removed === 'heat' ? '#e5e7eb' : '#ef4444'} strokeWidth={8} strokeLinecap="round" />
            <text x={36} y={92} fontSize={11} fontWeight={700} fill="#a16207" transform="rotate(-62 36 92)">FUEL</text>
            <text x={150} y={80} fontSize={11} fontWeight={700} fill="#0284c7" transform="rotate(62 150 80)">OXYGEN</text>
            <text x={100} y={176} fontSize={11} fontWeight={700} fill="#dc2626" textAnchor="middle">HEAT</text>
            {/* logs */}
            {removed !== 'fuel' && (
              <g>
                <rect x={68} y={148} width={64} height={10} rx={5} fill="#92400e" transform="rotate(-12 100 153)" />
                <rect x={68} y={148} width={64} height={10} rx={5} fill="#78350f" transform="rotate(12 100 153)" />
              </g>
            )}
            <AnimatePresence>{burning && <motion.g exit={{ opacity: 0 }}><Flame size={1} /></motion.g>}</AnimatePresence>
            {removed === 'heat' && <text x={100} y={128} textAnchor="middle" fontSize={26}>💦</text>}
            {removed === 'oxygen' && <path d="M60 158 Q100 110 140 158 Z" fill="#d6d3d1" />}
            {!burning && <motion.text x={100} y={100} textAnchor="middle" fontSize={22} initial={{ opacity: 0, y: 110 }} animate={{ opacity: 0.8, y: 90 }}>💨</motion.text>}
          </svg>
          <div className="mt-2 grid gap-2">
            {(Object.keys(SIDES) as Side[]).map((s) => (
              <Button key={s} variant={removed === s ? 'default' : 'outline'} disabled={!burning} onClick={() => setRemoved(s)} className="justify-start">
                {SIDES[s].emoji} {SIDES[s].remove}
              </Button>
            ))}
            {!burning && (
              <>
                <p role="status" className="rounded-lg bg-success-soft px-3 py-2 text-sm">
                  🧯 Fire out! {SIDES[removed!].how}
                </p>
                <Button variant="ghost" onClick={() => setRemoved(null)}>
                  🔥 Relight
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-background p-3">
          <p className="font-heading font-semibold">Candle in a jar</p>
          <svg viewBox="0 0 200 170" className="mx-auto w-full max-w-[220px]" role="img" aria-label={candleOut ? `Candle went out after ${candleT} seconds` : 'Candle burning'}>
            <rect x={88} y={100} width={24} height={60} rx={3} fill="#fef3c7" stroke="#d6d3d1" />
            <line x1={100} y1={100} x2={100} y2={92} stroke="#1f2937" strokeWidth={2} />
            {!candleOut && (
              <g transform="translate(0 -58)">
                <g transform={`translate(100 150) scale(${0.35 * flameSize}) translate(-100 -150)`}>
                  <Flame size={1} />
                </g>
              </g>
            )}
            {candleOut && <text x={100} y={82} textAnchor="middle" fontSize={16}>💨</text>}
            {jar !== 'none' && (
              <rect x={jar === 'small' ? 70 : 50} y={jar === 'small' ? 60 : 20} width={jar === 'small' ? 60 : 100} height={jar === 'small' ? 102 : 142} rx={8} fill="#bae6fd" fillOpacity={0.15} stroke="#7dd3fc" strokeWidth={3} />
            )}
            <rect x={30} y={160} width={140} height={6} rx={2} fill="#a8a29e" />
          </svg>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant={jar === 'small' ? 'default' : 'outline'} onClick={() => setJar('small')}>Cover with small jar</Button>
            <Button variant={jar === 'large' ? 'default' : 'outline'} onClick={() => setJar('large')}>Cover with large jar</Button>
            <Button variant="ghost" onClick={() => setJar('none')}>Remove jar</Button>
          </div>
          <p className="mt-2 text-sm tabular-nums">
            {jar === 'none' ? 'The candle burns steadily in open air.' : candleOut ? `🕯️ Went out after ${candleT.toFixed(1)} s (time sped up).` : `Burning under the ${jar} jar… ${candleT.toFixed(1)} s`}
          </p>
          {candleOut && (
            <p className={cn('mt-2 rounded-lg bg-chem-soft px-3 py-2 text-sm')}>
              The flame used up the oxygen in the jar. A <b>larger jar</b> holds more air (more oxygen), so the candle burns for longer. Oxygen is needed for burning!
            </p>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
