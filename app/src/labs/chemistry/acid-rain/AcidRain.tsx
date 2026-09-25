import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { universalColour } from '../../_kit/ph'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const SOLUTIONS = [
  { id: 'scrubbers', label: 'Scrubbers on factory chimneys', cut: 0.85, applies: 'factory' as const },
  { id: 'cng', label: 'Switch buses and autos to CNG / electric', cut: 0.7, applies: 'traffic' as const },
  { id: 'solar', label: 'Replace coal power with solar and wind', cut: 0.8, applies: 'power' as const },
]

export default function AcidRain() {
  const [factory, setFactory] = useState(60)
  const [traffic, setTraffic] = useState(60)
  const [power, setPower] = useState(60)
  const [years, setYears] = useState(10)
  const [on, setOn] = useState<string[]>([])

  const cut = (k: 'factory' | 'traffic' | 'power') => SOLUTIONS.filter((s) => s.applies === k && on.includes(s.id)).reduce((m, s) => m * (1 - s.cut), 1)
  const emissions = factory * cut('factory') * 0.4 + traffic * cut('traffic') * 0.25 + power * cut('power') * 0.35 // 0–100
  // clean rain is naturally slightly acidic (~5.6). Heavy pollution can push it towards ~4.
  const rainPH = Math.max(3.8, 5.6 - (emissions / 100) * 1.8)
  const damage = Math.min(100, Math.max(0, (5.6 - rainPH) * 18 * (years / 10)))
  const lakePH = Math.max(4.2, 7 - (5.6 - rainPH) * 1.1 * Math.min(1, years / 20))
  const fish = Math.max(0, Math.round(100 - Math.max(0, 6.5 - lakePH) * 60))

  const drops = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: 10 + ((i * 37) % 300), d: 0.8 + (i % 5) * 0.15, delay: (i % 7) * 0.15 })), [])

  return (
    <LabFrame
      labId="acid-rain"
      title="Acid Rain Simulator"
      subtitle="Pollution → acid rain → damaged monuments and lakes. Can you fix it?"
      howTo={<p>Change the amount of pollution and the number of years, then switch on solutions. Watch the rain pH, the marble monument and the fish in the lake.</p>}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <svg viewBox="0 0 320 200" className="w-full rounded-xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`Rain pH ${rainPH.toFixed(1)}; monument damage ${Math.round(damage)}%; fish population ${fish}%`}>
          {/* clouds */}
          <ellipse cx={80} cy={25} rx={60} ry={18} fill={emissions > 40 ? '#9ca3af' : '#e5e7eb'} />
          <ellipse cx={220} cy={25} rx={70} ry={20} fill={emissions > 40 ? '#9ca3af' : '#e5e7eb'} />
          {drops.map((d, i) => (
            <motion.line key={i} x1={d.x} x2={d.x - 2} stroke={universalColour(rainPH)} strokeWidth={2} animate={{ y1: [40, 150], y2: [48, 158] }} transition={{ repeat: Infinity, duration: d.d, delay: d.delay, ease: 'linear' }} />
          ))}
          {/* factory */}
          <rect x={10} y={130} width={40} height={50} fill="#64748b" />
          <rect x={30} y={100} width={10} height={30} fill="#475569" />
          {factory > 0 && <circle cx={35} cy={92} r={4 + factory / 15} fill="#6b7280" opacity={0.6 * cut('factory')} />}
          {/* monument (marble dome) */}
          <g>
            <rect x={120} y={140} width={70} height={40} fill="#f5f5f4" stroke="#d6d3d1" />
            <path d="M125 140 Q155 95 185 140 Z" fill="#fafaf9" stroke="#d6d3d1" />
            <rect x={120} y={140} width={70} height={40} fill="#78716c" opacity={damage / 160} />
            <path d="M125 140 Q155 95 185 140 Z" fill="#78716c" opacity={damage / 160} />
            {damage > 30 && Array.from({ length: Math.round(damage / 12) }, (_, i) => <circle key={i} cx={128 + ((i * 17) % 55)} cy={120 + ((i * 23) % 55)} r={1.8} fill="#57534e" />)}
          </g>
          {/* lake */}
          <path d="M210 175 Q260 160 315 175 V195 H210 Z" fill={universalColour(lakePH)} opacity={0.55} />
          {Array.from({ length: Math.round(fish / 25) }, (_, i) => <text key={i} x={225 + i * 22} y={190} fontSize={12}>🐟</text>)}
          <rect x={0} y={180} width={210} height={20} fill="#a3e635" opacity={0.5} />
        </svg>

        <div className="space-y-3">
          {[
            { label: '🏭 Factories', v: factory, set: setFactory },
            { label: '🚗 Traffic', v: traffic, set: setTraffic },
            { label: '⚡ Coal power stations', v: power, set: setPower },
          ].map((c) => (
            <label key={c.label} className="block text-sm">
              {c.label}: <b>{c.v}%</b>
              <Slider value={[c.v]} min={0} max={100} step={5} onValueChange={([v]) => c.set(v)} className="mt-1.5" aria-label={c.label} />
            </label>
          ))}
          <label className="block text-sm">
            ⏳ Years of exposure: <b>{years}</b>
            <Slider value={[years]} min={1} max={50} step={1} onValueChange={([v]) => setYears(v)} className="mt-1.5" aria-label="Years" />
          </label>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Readout label="Rain pH" value={rainPH.toFixed(1)} />
        <Readout label="Lake pH" value={lakePH.toFixed(1)} />
        <Readout label="Monument damage" value={`${Math.round(damage)}%`} />
        <Readout label="Fish population" value={`${fish}%`} />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold">🛠️ Switch on solutions</p>
        <div className="flex flex-wrap gap-2">
          {SOLUTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => setOn((o) => (o.includes(s.id) ? o.filter((x) => x !== s.id) : [...o, s.id]))} className={cn('rounded-full border-2 px-3 py-1.5 text-sm', on.includes(s.id) ? 'border-success bg-success-soft font-semibold' : 'hover:bg-muted')}>
              {on.includes(s.id) ? '✅' : '⬜'} {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {rainPH >= 5.3
          ? '🌦️ Normal rain is naturally slightly acidic (about pH 5.6) because carbon dioxide dissolves in it. Your city is doing well!'
          : `☔ Acid rain! Sulfur dioxide and nitrogen oxides from burning fuels dissolve in rain to form sulfuric and nitric acids. Marble (calcium carbonate) reacts with acid and slowly wears away, and acidic lakes harm fish.`}
      </p>
    </LabFrame>
  )
}
