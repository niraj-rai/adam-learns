import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { LISTENERS, SPEED, band, canHear, distanceFromEcho } from '../_shared/waves'

// log scale from 1 Hz to 200 kHz
const LO = 0
const HI = Math.log10(200000)
const toF = (s: number) => Math.round(10 ** (LO + (s / 100) * (HI - LO)))
const toS = (f: number) => ((Math.log10(f) - LO) / (HI - LO)) * 100
const fmt = (f: number) => (f >= 1000 ? `${(f / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} kHz` : `${f} Hz`)

const USES: Record<string, string[]> = {
  infrasound: ['🐘 Elephants call to each other across kilometres', '🌋 Earthquakes and volcanoes give off infrasound before they strike', '🐋 Whales communicate with very low notes'],
  audible: ['🗣️ Speech is mostly 100 Hz – 4 kHz', '🎵 A piano spans about 27 Hz – 4.2 kHz', '👂 Our ears are most sensitive around 2 – 5 kHz'],
  ultrasound: ['🦇 Bats find insects by echolocation', '🚢 SONAR measures sea depth and finds submarines', '🩺 Medical scans (1 – 15 MHz) image babies and organs safely', '🔧 Finding cracks inside metal parts; ultrasonic cleaning'],
}

export default function HearingRange() {
  const [f, setF] = useState(1000)
  const [t, setT] = useState(2)
  const b = band(f)
  return (
    <LabFrame labId="hearing-range" title="Who Can Hear It?" subtitle="Humans hear about 20 Hz to 20 000 Hz. Below is infrasound; above is ultrasound." howTo={<p>Slide the frequency and see which animals can hear it. Then use a ship's SONAR echo to measure the depth of the sea.</p>}>
      <label className="block text-sm">Frequency <b>{fmt(f)}</b> · <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', b === 'audible' ? 'bg-success-soft text-success' : 'bg-brand-soft text-brand')}>{b}</span><Slider value={[toS(f)]} min={0} max={100} step={0.25} onValueChange={([s]) => setF(Math.max(1, toF(s)))} className="mt-1" aria-label="frequency" /></label>
      <div className="mt-3 space-y-1.5">
        {LISTENERS.map((l) => {
          const hears = canHear(l, f)
          return (
            <div key={l.name} className="flex items-center gap-2 text-sm">
              <span className={cn('w-24 shrink-0', hears ? 'font-semibold' : 'opacity-50')}>{l.emoji} {l.name}</span>
              <div className="relative h-5 flex-1 rounded-full bg-muted">
                <div className={cn('absolute top-0 h-full rounded-full', hears ? 'bg-success' : 'bg-chem/50')} style={{ left: `${toS(l.lo)}%`, width: `${toS(l.hi) - toS(l.lo)}%` }} />
                <div className="absolute -top-1 h-7 w-0.5 bg-red-500" style={{ left: `${toS(f)}%` }} />
              </div>
              <span className="w-8 shrink-0 text-center">{hears ? '👂' : '—'}</span>
            </div>
          )
        })}
        <div className="flex gap-2 text-[10px] text-muted-foreground">
          <span className="w-24 shrink-0" />
          <div className="relative h-4 flex-1">{[1, 20, 1000, 20000, 200000].map((x) => <span key={x} className={cn('absolute whitespace-nowrap', x === 1 ? '' : x === 200000 ? '-translate-x-full' : '-translate-x-1/2')} style={{ left: `${toS(x)}%` }}>{fmt(x)}</span>)}</div>
          <span className="w-8 shrink-0" />
        </div>
      </div>
      <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">{USES[b].map((u) => <li key={u} className="rounded-xl bg-muted/50 px-3 py-2">{u}</li>)}</ul>
      <div className="mt-5 grid gap-4 rounded-2xl border p-3 md:grid-cols-[220px_1fr]">
        <svg viewBox="0 0 220 160" className="w-full max-w-[220px]" role="img" aria-label={`Sea ${distanceFromEcho(t, SPEED.seaWater).toFixed(0)} m deep`}>
          <rect x={0} y={30} width={220} height={130} fill="#0ea5e9" opacity={0.25} />
          <text x={96} y={30} fontSize={22}>🚢</text>
          <path d="M0,150 Q60,140 110,152 T220,146 L220,160 L0,160 Z" fill="#a16207" opacity={0.6} />
          <line x1={110} y1={34} x2={110} y2={148} stroke="#6366f1" strokeDasharray="4 4" />
          <text x={116} y={95} fontSize={10} fill="currentColor">{distanceFromEcho(t, SPEED.seaWater).toFixed(0)} m</text>
        </svg>
        <div className="space-y-3">
          <p className="font-heading text-lg font-semibold">🚢 SONAR depth finder</p>
          <label className="block text-sm">Echo returns after <b>{t} s</b><Slider value={[t]} min={0.2} max={8} step={0.1} onValueChange={([v]) => setT(v)} className="mt-1" aria-label="echo time" /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Speed of sound in sea water" value={`${SPEED.seaWater} m/s`} />
            <Readout label="Depth = v × t ÷ 2" value={`${SPEED.seaWater} × ${t} ÷ 2 = ${distanceFromEcho(t, SPEED.seaWater).toFixed(0)} m`} />
          </div>
          <p className="text-sm text-muted-foreground">We divide by 2 because the pulse goes down <i>and</i> back up. SONAR uses ultrasound because short wavelengths give sharp echoes and travel in a narrow beam.</p>
        </div>
      </div>
    </LabFrame>
  )
}
