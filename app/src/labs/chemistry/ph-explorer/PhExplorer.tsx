import { motion } from 'motion/react'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { SOLUTIONS, natureOf, universalColour } from '../../_kit/ph'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Diluting 10× moves pH one unit towards 7 (exact for strong acids/bases; a simplification for weak ones). */
function dilutedPH(pH: number, steps: number) {
  if (pH < 7) return Math.min(7, pH + steps)
  if (pH > 7) return Math.max(7, pH - steps)
  return 7
}

export default function PhExplorer() {
  const [id, setId] = useState('lemon')
  const [dilution, setDilution] = useState(0)
  const [tested, setTested] = useState<string[]>(['lemon'])
  const s = SOLUTIONS.find((x) => x.id === id)!
  const pH = dilutedPH(s.pH, dilution)
  const nature = natureOf(pH)
  const times = Math.pow(10, Math.abs(7 - pH))

  const pick = (sid: string) => {
    setId(sid)
    setDilution(0)
    setTested((t) => (t.includes(sid) ? t : [...t, sid]))
  }

  return (
    <LabFrame
      labId="ph-explorer"
      title="pH Explorer"
      subtitle="Measure the pH of 19 substances, then dilute them"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Pick a substance: the pH meter and universal indicator show its pH.</li>
          <li>Every substance you test gets marked on the pH scale. Test them all!</li>
          <li>Use the dilution slider to add water. Each step makes it 10 times more dilute.</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SOLUTIONS.map((x) => (
          <button key={x.id} type="button" onClick={() => pick(x.id)} className={cn('rounded-full border px-2.5 py-1 text-xs', x.id === id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted', tested.includes(x.id) && x.id !== id && 'bg-muted/60')}>
            {x.emoji} {x.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
        <div className="space-y-2">
          <svg viewBox="0 0 160 170" className="mx-auto w-full max-w-[180px]" role="img" aria-label={`${s.name}, pH ${pH.toFixed(1)}, ${nature}`}>
            <motion.rect x={30} y={50} width={100} height={105} rx={6} animate={{ fill: universalColour(pH) }} transition={{ duration: 0.6 }} opacity={0.75} />
            <path d="M28 20 V150 a8 8 0 0 0 8 8 H124 a8 8 0 0 0 8 -8 V20" fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={3} />
            <rect x={96} y={4} width={10} height={110} rx={3} fill="#e5e7eb" stroke="#9ca3af" />
            <rect x={90} y={0} width={22} height={14} rx={3} fill="#334155" />
          </svg>
          <Readout label="pH meter" value={pH.toFixed(1)} />
          <p className={cn('rounded-lg px-3 py-1.5 text-center text-sm font-semibold capitalize', nature === 'acidic' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' : nature === 'basic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200' : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200')}>
            {nature}
          </p>
        </div>

        <div className="space-y-4">
          {/* pH scale */}
          <div>
            <div className="relative h-10 overflow-hidden rounded-lg border">
              <div className="flex h-full">
                {Array.from({ length: 15 }, (_, i) => (
                  <div key={i} className="grid flex-1 place-items-center text-[10px] font-bold text-white/90" style={{ background: universalColour(i) }}>
                    {i}
                  </div>
                ))}
              </div>
              <motion.div className="absolute top-0 h-full w-1 bg-foreground shadow" animate={{ left: `calc(${(pH / 14) * 100}% - 2px)` }} />
            </div>
            <div className="mt-1 flex justify-between text-xs font-semibold">
              <span className="text-red-600">← more acidic</span>
              <span className="text-green-600">neutral 7</span>
              <span className="text-blue-600">more basic →</span>
            </div>
            <div className="relative mt-2 h-28">
              {tested.map((tid, i) => {
                const t = SOLUTIONS.find((x) => x.id === tid)!
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => pick(tid)}
                    className="absolute -translate-x-1/2 text-lg"
                    style={{ left: `${(t.pH / 14) * 100}%`, top: `${(i % 4) * 26}px` }}
                    title={`${t.name}: pH ${t.pH}`}
                    aria-label={`${t.name}: pH ${t.pH}`}
                  >
                    {t.emoji}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground">Tested {tested.length} / {SOLUTIONS.length}. Tap an emoji to select it again.</p>
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-sm font-semibold">
              💧 Dilute with water: {dilution === 0 ? 'undiluted' : `${Math.pow(10, dilution).toLocaleString()}× more dilute`}
            </p>
            <Slider value={[dilution]} min={0} max={5} step={1} onValueChange={([v]) => setDilution(v)} aria-label="Dilution steps" className="mt-2" disabled={s.pH === 7} />
            <p className="mt-2 text-sm text-muted-foreground">
              {nature === 'neutral'
                ? 'Neutral: the same balance of acid and base as pure water.'
                : `This is about ${times >= 1e6 ? times.toExponential(0) : Math.round(times).toLocaleString()} times more ${nature === 'acidic' ? 'acidic' : 'basic'} than pure water. Each step on the pH scale is a 10× change!`}
            </p>
            {dilution > 0 && s.pH !== 7 && <p className="mt-1 text-sm">Adding water moves the pH <b>towards 7</b>, but it never crosses to the other side.</p>}
          </div>
          {s.note && <p className="text-sm">💡 {s.note}</p>}
        </div>
      </div>
    </LabFrame>
  )
}
