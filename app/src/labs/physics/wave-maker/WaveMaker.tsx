import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { startTone } from '../../_kit/audio'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { canHear, classify, HEARING, logFreq, logPos, period } from './model'

export default function WaveMaker() {
  const [pos, setPos] = useState(logPos(440))
  const [amp, setAmp] = useState(50)
  const [on, setOn] = useState(false)
  const [ultra, setUltra] = useState(false)
  const f = ultra ? 40000 : logFreq(pos)
  const tone = useRef<ReturnType<typeof startTone>>(null)

  // quiet by design: max gain 0.2; very high frequencies are made quieter still
  const gain = (amp / 100) * 0.2 * (f > 8000 ? 0.4 : 1)
  useEffect(() => {
    if (!on) return
    tone.current = startTone(Math.min(f, 20000), gain)
    return () => tone.current?.stop()
  }, [on]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { tone.current?.set(Math.min(f, 20000), ultra ? 0 : gain) }, [f, gain, ultra])

  // draw the wave: the number of visible waves grows with frequency (log-scaled so it stays readable)
  const waves = Math.max(1, Math.round(2 + logPos(Math.min(f, 20000)) * 14))
  const A = (amp / 100) * 60
  const pts = Array.from({ length: 401 }, (_, i) => `${i},${80 - A * Math.sin((i / 400) * waves * 2 * Math.PI)}`).join(' ')

  return (
    <LabFrame labId="wave-maker" title="Wave Maker" subtitle="Pitch depends on frequency; loudness depends on amplitude. Hear and see the difference." howTo={<p>Press Play (start with your volume LOW, and don't use headphones at full volume). Slide the frequency to change the pitch and the amplitude to change the loudness. Then find out which animals can hear each sound.</p>}>
      <svg viewBox="0 0 400 160" className="w-full rounded-2xl border bg-slate-950" role="img" aria-label={`Sound wave at ${f} hertz with amplitude ${amp} percent`}>
        <line x1={0} y1={80} x2={400} y2={80} stroke="#334155" />
        <polyline points={pts} fill="none" stroke={ultra ? '#a78bfa' : '#38bdf8'} strokeWidth={2.5} />
        <line x1={8} y1={80} x2={8} y2={80 - A} stroke="#fbbf24" strokeWidth={2} />
        <text x={14} y={80 - A / 2} fontSize={10} fill="#fbbf24">amplitude</text>
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOn((o) => !o)}>{on ? '⏹ Stop' : '▶ Play'}</Button>
            {[['Low hum', 100], ['Middle (440 Hz)', 440], ['Whistle', 3000], ['Mosquito', 10000]].map(([l, v]) => (
              <Button key={l} size="sm" variant="outline" onClick={() => { setUltra(false); setPos(logPos(v as number)) }}>{l}</Button>
            ))}
            <Button size="sm" variant={ultra ? 'default' : 'outline'} onClick={() => setUltra((u) => !u)}>🦇 Ultrasound (40 kHz)</Button>
          </div>
          <label className="block text-sm">Frequency (pitch): <b>{f.toLocaleString('en-IN')} Hz</b>
            <Slider value={[pos]} min={0} max={1} step={0.001} disabled={ultra} onValueChange={([v]) => setPos(v)} className="mt-1.5" aria-label="Frequency" />
          </label>
          <label className="block text-sm">Amplitude (loudness): <b>{amp}%</b>
            <Slider value={[amp]} min={5} max={100} step={5} onValueChange={([v]) => setAmp(v)} className="mt-1.5" aria-label="Amplitude" />
          </label>
          <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">
            {ultra ? 'Ultrasound is above 20,000 Hz: too high for humans to hear, so no sound is played. Bats, dogs and dolphins can hear it. Doctors use ultrasound to see babies inside the womb.' : `${classify(f) === 'audible' ? 'Audible sound.' : ''} Higher frequency = more vibrations per second = higher pitch. Bigger amplitude = bigger vibrations = louder sound. Each vibration here takes ${(period(f) * 1000).toFixed(2)} milliseconds.`}
          </p>
        </div>
        <div className="space-y-2">
          <Readout label="Frequency" value={`${f.toLocaleString('en-IN')} Hz`} />
          <p className="pt-1 text-sm font-semibold">Who can hear it?</p>
          <div className="grid grid-cols-2 gap-1.5">
            {HEARING.map((h) => (
              <div key={h.id} className={cn('rounded-lg border px-2 py-1 text-xs', canHear(h.id, f) ? 'border-success bg-success-soft' : 'opacity-50')}>
                {h.emoji} {h.name} {canHear(h.id, f) ? '✅' : '❌'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LabFrame>
  )
}
