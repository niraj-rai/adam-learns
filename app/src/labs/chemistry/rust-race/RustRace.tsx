import { motion } from 'motion/react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Tube = { id: string; label: string; detail: string; air: boolean; water: boolean; rate: number; liquid?: string; oil?: boolean; coat?: 'paint' | 'zinc'; why: string }

/** rate = fraction of the nail surface rusted per day (capped at 1). */
const TUBES: Tube[] = [
  { id: 'A', label: 'Dry air', detail: 'Drying agent + stopper', air: true, water: false, rate: 0, why: 'Air but NO water, so no rust.' },
  { id: 'B', label: 'Boiled water + oil', detail: 'Boiling removes air; oil stops it coming back', air: false, water: true, rate: 0.01, liquid: '#e0f2fe', oil: true, why: 'Water but (almost) NO air, so almost no rust.' },
  { id: 'C', label: 'Tap water', detail: 'Open to the air', air: true, water: true, rate: 0.09, liquid: '#e0f2fe', why: 'Air AND water, so it rusts.' },
  { id: 'D', label: 'Salt water', detail: 'Like sea water', air: true, water: true, rate: 0.17, liquid: '#dbeafe', why: 'Air, water AND salt: salt speeds up rusting. That is why coastal cities and ships have a big rust problem.' },
  { id: 'E', label: 'Painted nail', detail: 'In tap water', air: true, water: true, rate: 0, liquid: '#e0f2fe', coat: 'paint', why: 'The paint keeps air and water away from the iron.' },
  { id: 'F', label: 'Galvanised nail', detail: 'Zinc-coated, in tap water', air: true, water: true, rate: 0, liquid: '#e0f2fe', coat: 'zinc', why: 'The zinc coating protects the iron. Even if scratched, zinc corrodes first (galvanising).' },
]
const DAYS = 10

function Nail({ rust, coat }: { rust: number; coat?: Tube['coat'] }) {
  const base = coat === 'paint' ? '#16a34a' : coat === 'zinc' ? '#cbd5e1' : '#6b7280'
  return (
    <g>
      <rect x={27} y={30} width={16} height={5} rx={1.5} fill={base} />
      <path d="M31 35 h8 v88 l-4 10 l-4 -10 z" fill={base} />
      {rust > 0 && (
        <>
          <path d="M31 35 h8 v88 l-4 10 l-4 -10 z" fill="#b45309" opacity={Math.min(0.85, rust)} />
          {Array.from({ length: Math.round(rust * 14) }, (_, i) => (
            <circle key={i} cx={30 + ((i * 7) % 11)} cy={45 + ((i * 29) % 80)} r={1.6 + (i % 3) * 0.6} fill="#7c2d12" opacity={0.8} />
          ))}
        </>
      )}
    </g>
  )
}

export default function RustRace() {
  const [day, setDay] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [prediction, setPrediction] = useState<string | null>(null)

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setDay((d) => {
      if (d >= DAYS) {
        setPlaying(false)
        return d
      }
      return Math.min(DAYS, Math.round((d + 0.25) * 100) / 100)
    }), 120)
    return () => clearInterval(t)
  }, [playing])

  const done = day >= DAYS
  useEffect(() => {
    if (done && prediction) (prediction === 'D' ? sfx.win : sfx.click)()
  }, [done, prediction])

  return (
    <LabFrame
      labId="rust-race"
      title="Rust Race"
      subtitle="Which nail rusts, and which is protected?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Six identical iron nails are set up in different conditions.</li>
          <li>Predict which nail will rust the MOST, then press play to fast-forward 10 days.</li>
          <li>Compare tubes that differ in only ONE thing to find out what rusting needs.</li>
        </ul>
      }
    >
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {TUBES.map((t) => {
          const rust = Math.min(1, t.rate * day)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => day === 0 && setPrediction(t.id)}
              className={cn('flex flex-col items-center rounded-xl border-2 bg-background p-2 text-center transition', prediction === t.id && 'border-primary ring-2 ring-primary/30', day === 0 && 'hover:border-primary/50')}
              aria-label={`Tube ${t.id}: ${t.label}. ${Math.round(rust * 100)}% rusted`}
            >
              <svg viewBox="0 0 70 160" className="h-40 w-auto">
                {t.liquid && <rect x={12} y={60} width={46} height={92} rx={8} fill={t.liquid} />}
                {t.oil && <rect x={12} y={52} width={46} height={10} fill="#fde047" opacity={0.8} />}
                {t.id === 'A' && <g>{[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={20 + i * 6} cy={146} r={3.5} fill="#e5e7eb" stroke="#9ca3af" />)}</g>}
                <Nail rust={rust} coat={t.coat} />
                <path d="M10 18 V144 a14 14 0 0 0 28 0 h-4 M60 18 V144 a14 14 0 0 1 -28 0" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={2.5} />
                {(t.id === 'A' || t.id === 'B') && <rect x={8} y={10} width={54} height={10} rx={2} fill="#78716c" />}
              </svg>
              <span className="font-heading text-sm font-semibold">
                {t.id}. {t.label}
              </span>
              <span className="text-[11px] text-muted-foreground">{t.detail}</span>
              <span className="mt-1 text-xs">
                {t.air ? '🌬️' : '🚫🌬️'} {t.water ? '💧' : '🚫💧'}
              </span>
              {day > 0 && <span className="mt-1 text-xs font-semibold tabular-nums">{Math.round(rust * 100)}% rusted</span>}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={() => setPlaying((p) => !p)} disabled={!prediction || done}>
          {playing ? <Pause /> : <Play />} {playing ? 'Pause' : day === 0 ? 'Start the 10-day test' : 'Continue'}
        </Button>
        <Button size="lg" variant="ghost" onClick={() => { setDay(0); setPlaying(false); setPrediction(null) }}>
          <RotateCcw /> Reset
        </Button>
        <div className="min-w-48 flex-1">
          <p className="text-sm font-semibold">Day {Math.floor(day)} of {DAYS}</p>
          <Slider value={[day]} min={0} max={DAYS} step={0.25} disabled={!prediction} onValueChange={([v]) => { setDay(v); setPlaying(false) }} aria-label="Day" />
        </div>
      </div>
      {!prediction && <p className="mt-2 text-sm text-muted-foreground">🔮 Tap the tube you think will rust the most to start.</p>}

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className="mt-4 space-y-2 rounded-xl border bg-chem-soft p-4 text-sm">
          <p className="font-semibold">
            {prediction === 'D' ? '🎯 You predicted it! ' : `Your prediction: tube ${prediction}. `}Tube <b>D (salt water)</b> rusted the most.
          </p>
          <ul className="space-y-1">
            {TUBES.map((t) => (
              <li key={t.id}>
                <b>{t.id}:</b> {t.why}
              </li>
            ))}
          </ul>
          <p className="font-semibold">Conclusion: iron needs BOTH oxygen (air) AND water to rust. Salt speeds it up; paint, oil, grease and zinc coatings protect it.</p>
        </motion.div>
      )}
    </LabFrame>
  )
}
