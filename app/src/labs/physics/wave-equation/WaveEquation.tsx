import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useSettings } from '@/stores/settings'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SPEED, period, wavelength } from '../_shared/waves'

const MEDIA = [
  { id: 'air', name: 'Air', emoji: '💨', v: SPEED.air },
  { id: 'water', name: 'Water', emoji: '💧', v: SPEED.water },
  { id: 'steel', name: 'Steel', emoji: '🔩', v: SPEED.steel },
] as const
// log slider from 20 Hz to 20 000 Hz
const toF = (s: number) => Math.round(20 * 1000 ** (s / 100))
const toS = (f: number) => (100 * Math.log(f / 20)) / Math.log(1000)
const NOTES = [{ n: 'Sa (C4)', f: 262 }, { n: 'A4 (tuning)', f: 440 }, { n: 'Whistle', f: 2000 }, { n: 'Mosquito', f: 600 }]

function fmtLen(m: number) {
  return m >= 1 ? `${m.toFixed(2)} m` : m >= 0.01 ? `${(m * 100).toFixed(1)} cm` : `${(m * 1000).toFixed(1)} mm`
}

export default function WaveEquation() {
  const [f, setF] = useState(440)
  const [amp, setAmp] = useState(0.6)
  const [mid, setMid] = useState<(typeof MEDIA)[number]['id']>('air')
  const soundOn = useSettings((s) => s.sound)
  const ctx = useRef<AudioContext | null>(null)
  const medium = MEDIA.find((m) => m.id === mid)!
  const lam = wavelength(medium.v, f)
  const T = period(f)
  const play = () => {
    if (!soundOn) return
    try {
      ctx.current ??= new AudioContext()
      const c = ctx.current
      const osc = c.createOscillator()
      const gain = c.createGain()
      osc.frequency.value = f
      const now = c.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.02 + 0.18 * amp, now + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1)
      osc.connect(gain).connect(c.destination)
      osc.start(now)
      osc.stop(now + 1.05)
    } catch { /* audio is optional */ }
  }
  // draw 3 cycles, whatever the frequency, with a length scale bar
  const Wd = 560
  const pts = Array.from({ length: 241 }, (_, i) => `${20 + (i / 240) * (Wd - 40)},${80 - amp * 55 * Math.sin((i / 240) * 3 * 2 * Math.PI)}`).join(' ')
  return (
    <LabFrame labId="wave-equation" title="Wave Equation" subtitle="Speed = frequency × wavelength (v = fλ). Higher pitch means a shorter wavelength." howTo={<p>Change the frequency (pitch) and amplitude (loudness), and pick what the sound travels through. Press Play to hear the note (turn Sounds on in settings).</p>}>
      <div className="flex flex-wrap gap-1">
        {MEDIA.map((m) => <button key={m.id} type="button" aria-pressed={mid === m.id} onClick={() => setMid(m.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', mid === m.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{m.emoji} {m.name} <span className="text-xs text-muted-foreground">{m.v} m/s</span></button>)}
      </div>
      <svg viewBox={`0 0 ${Wd} 170`} className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Three wavelengths, each ${fmtLen(lam)}`}>
        <line x1={20} y1={80} x2={Wd - 20} y2={80} stroke="currentColor" strokeOpacity={0.2} />
        <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={20 + (i * (Wd - 40)) / 3} y1={20} x2={20 + (i * (Wd - 40)) / 3} y2={140} stroke="#10b981" strokeDasharray="3 3" />)}
        <text x={20 + (Wd - 40) / 6} y={158} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight={600}>λ = {fmtLen(lam)}</text>
        <text x={Wd - 22} y={158} textAnchor="end" fontSize={10} fill="currentColor" opacity={0.7}>3 wavelengths shown</text>
        <line x1={Wd - 30} y1={80} x2={Wd - 30} y2={80 - amp * 55} stroke="#f59e0b" strokeWidth={2} />
        <text x={Wd - 36} y={80 - amp * 27} textAnchor="end" fontSize={10} fill="#f59e0b">amplitude</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Frequency f = <b>{f.toLocaleString('en-IN')} Hz</b><Slider value={[toS(f)]} min={0} max={100} step={0.5} onValueChange={([s]) => setF(toF(s))} className="mt-1" aria-label="frequency" /></label>
        <label className="text-sm">Amplitude <b>{Math.round(amp * 100)}%</b><Slider value={[amp]} min={0.1} max={1} step={0.05} onValueChange={([v]) => setAmp(v)} className="mt-1" aria-label="amplitude" /></label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
        {NOTES.map((n) => <button key={n.n} type="button" onClick={() => setF(n.f)} className="rounded-full border px-2 py-0.5 hover:bg-muted">{n.n} · {n.f} Hz</button>)}
        <Button size="sm" className="ml-auto" onClick={play} disabled={!soundOn}>{soundOn ? '🔊 Play 1 s' : '🔇 Sounds are off'}</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Time period T = 1 ÷ f" value={T >= 0.001 ? `${(T * 1000).toFixed(2)} ms` : `${(T * 1e6).toFixed(0)} µs`} />
        <Readout label="Wavelength λ = v ÷ f" value={`${medium.v} ÷ ${f} = ${fmtLen(lam)}`} />
        <Readout label="Check: f × λ" value={`${(f * lam).toFixed(0)} m/s`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm"><b>Frequency</b> (Hz) sets the <b>pitch</b>; <b>amplitude</b> sets the <b>loudness</b>. In one medium the speed is fixed, so doubling the frequency halves the wavelength. Sound travels about 4 times faster in water and over 17 times faster in steel than in air, so the same note has a longer wavelength there.</p>
    </LabFrame>
  )
}
