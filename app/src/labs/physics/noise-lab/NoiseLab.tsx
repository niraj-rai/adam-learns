import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { formatHours, safeHours, SOUNDS, ZONES } from './model'

export default function NoiseLab() {
  const [sid, setSid] = useState('talk')
  const s = SOUNDS.find((x) => x.id === sid)!
  const hours = safeHours(s.db)
  const danger = s.db >= 85

  return (
    <LabFrame labId="noise-lab" title="Noise Lab" subtitle="How loud is too loud? Explore the decibel scale, safe listening times and India's noise rules." howTo={<p>Tap a sound on the decibel ladder to see how long you could safely listen to it each day. Then (optionally) use your device's microphone as a rough sound meter.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-1.5">
          {[...SOUNDS].reverse().map((x) => (
            <button key={x.id} type="button" onClick={() => setSid(x.id)} className={cn('flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm', x.id === sid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
              <span className="w-8 text-lg">{x.emoji}</span>
              <span className="flex-1">{x.name}</span>
              <span className="relative h-2.5 w-28 overflow-hidden rounded-full bg-muted">
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(x.db / 140) * 100}%`, background: x.db >= 85 ? '#ef4444' : x.db >= 70 ? '#f59e0b' : '#22c55e' }} />
              </span>
              <span className="w-14 text-right tabular-nums">{x.db} dB</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <Readout label="Sound level" value={`${s.db} dB`} />
          <Readout label="Safe listening per day" value={formatHours(hours)} className={cn(danger && 'text-destructive')} />
          <p role="status" className={cn('rounded-lg p-3 text-sm', danger ? 'bg-warn-soft' : 'bg-chem-soft')}>
            {danger ? `⚠️ Above 85 dB, sound can permanently damage the tiny hair cells in your inner ear. At ${s.db} dB, the safe time is only ${formatHours(hours)}.` : 'Comfortable. Sounds below about 70 dB are safe to listen to all day.'}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border p-3">
        <p className="mb-2 text-sm font-semibold">🇮🇳 India's noise limits (Noise Pollution Rules, 2000)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="py-1">Zone</th><th>Day</th><th>Night</th></tr></thead>
            <tbody>{ZONES.map((z) => <tr key={z.id} className="border-b border-dashed"><td className="py-1">{z.name}</td><td>{z.day} dB</td><td>{z.night} dB</td></tr>)}</tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Loudspeakers are generally not allowed between 10 pm and 6 am. Horns are banned in silence zones.</p>
      </div>

      <MicMeter />
    </LabFrame>
  )
}

/** Optional: a rough, uncalibrated loudness meter using the microphone. Nothing is recorded or sent anywhere. */
function MicMeter() {
  const [on, setOn] = useState(false)
  const [level, setLevel] = useState(0)
  const [err, setErr] = useState<string | null>(null)
  const stop = useRef<() => void>(() => {})

  useEffect(() => () => stop.current(), [])

  const start = async () => {
    setErr(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const an = ctx.createAnalyser()
      an.fftSize = 1024
      src.connect(an)
      const buf = new Float32Array(an.fftSize)
      let raf = 0
      const loop = () => {
        an.getFloatTimeDomainData(buf)
        const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)
        // map roughly onto a 30–100 "dB-ish" scale for display only
        setLevel(Math.max(30, Math.min(100, 20 * Math.log10(rms + 1e-6) + 100)))
        raf = requestAnimationFrame(loop)
      }
      loop()
      stop.current = () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); void ctx.close(); setOn(false) }
      setOn(true)
    } catch {
      setErr('Microphone not available or permission was not given. That’s fine: the rest of the lab works without it.')
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-dashed p-3">
      <p className="text-sm font-semibold">🎙️ Optional: rough loudness meter</p>
      <p className="text-xs text-muted-foreground">Uses your microphone only while it's on. Nothing is recorded or sent. It isn't calibrated, so compare sounds with each other rather than trusting the exact number.</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button size="sm" variant={on ? 'default' : 'outline'} onClick={() => (on ? stop.current() : void start())}>{on ? '⏹ Stop meter' : '🎙️ Start meter'}</Button>
        {on && (
          <div className="flex flex-1 items-center gap-2">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-3 rounded-full transition-[width]" style={{ width: `${((level - 30) / 70) * 100}%`, background: level > 85 ? '#ef4444' : level > 70 ? '#f59e0b' : '#22c55e' }} />
            </div>
            <span className="w-16 text-sm tabular-nums">≈ {level.toFixed(0)}</span>
          </div>
        )}
      </div>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  )
}
