import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const W = 560
const COLS = 46
const ROWS = 6
const GAP = (W - 40) / COLS
const TRACKED = 20

export default function LongitudinalWave() {
  const [mode, setMode] = useState<'long' | 'trans'>('long')
  const [amp, setAmp] = useState(8)
  const [lambdaCols, setLambdaCols] = useState(15)
  const [running, setRunning] = useState(true)
  const [t, setT] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    const tick = (now: number) => {
      setT((x) => x + (now - last) / 1000)
      last = now
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running])
  const k = (2 * Math.PI) / (lambdaCols * GAP)
  const w = 2 * Math.PI * 0.6 // slowed down: 0.6 cycles per second
  const disp = (x0: number) => amp * Math.sin(k * x0 - w * t)
  // particles bunch up (compressions) where the phase kx − ωt = π, one wavelength apart
  const lam = lambdaCols * GAP
  const first = ((((w * t + Math.PI) / k) % lam) + lam) % lam
  const compressions = Array.from({ length: 8 }, (_, n) => first + n * lam).filter((x) => x > 30 && x < W - 20)
  return (
    <LabFrame labId="longitudinal-wave" title="Longitudinal Waves" subtitle="Sound is a longitudinal wave: air particles vibrate back and forth along the direction the wave travels." howTo={<p>Watch the particles. The red one never travels along with the wave: it only jiggles back and forth. Switch to a transverse wave to compare.</p>}>
      <div className="mb-3 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['long', '🔊 Longitudinal (sound)'], ['trans', '🌊 Transverse (water ripples, light)']] as const).map(([m, l]) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn('rounded-md px-3 py-1', mode === m ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <svg viewBox={`0 0 ${W} 238`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`${mode === 'long' ? 'Longitudinal' : 'Transverse'} wave moving to the right`}>
        <text x={8} y={100} fontSize={22}>🔈</text>
        {Array.from({ length: COLS }, (_, i) => {
          const x0 = 36 + i * GAP
          return Array.from({ length: ROWS }, (_, r) => {
            const y0 = 40 + r * 22
            const d = disp(x0)
            const x = mode === 'long' ? x0 + d : x0
            const y = mode === 'long' ? y0 : y0 + d * 1.6
            return <circle key={`${i}-${r}`} cx={x} cy={y} r={3.2} fill={i === TRACKED && r === 2 ? '#ef4444' : '#6366f1'} opacity={i === TRACKED && r === 2 ? 1 : 0.75} />
          })
        })}
        {mode === 'long' && compressions.map((x, i) => <text key={i} x={x} y={28} textAnchor="middle" fontSize={10} fill="currentColor" fontWeight={600}>C</text>)}
        {mode === 'long' && compressions.map((x, i) => x + (lambdaCols * GAP) / 2 < W - 20 && <text key={`r${i}`} x={x + (lambdaCols * GAP) / 2} y={28} textAnchor="middle" fontSize={10} fill="currentColor" opacity={0.6}>R</text>)}
        {/* pressure graph */}
        <line x1={20} y1={196} x2={W - 10} y2={196} stroke="currentColor" strokeOpacity={0.3} />
        <polyline fill="none" stroke="#f59e0b" strokeWidth={2} points={Array.from({ length: 120 }, (_, i) => { const x = 20 + (i / 119) * (W - 30); return `${x},${196 - 13 * (mode === 'long' ? -Math.cos(k * x - w * t) : Math.sin(k * x - w * t))}` }).join(' ')} />
        <text x={W - 12} y={176} textAnchor="end" fontSize={9} fill="#f59e0b">{mode === 'long' ? 'air pressure (high at C, low at R)' : 'displacement'}</text>
        <line x1={36} y1={222} x2={36 + lambdaCols * GAP} y2={222} stroke="#10b981" strokeWidth={2} />
        <text x={36 + (lambdaCols * GAP) / 2} y={234} textAnchor="middle" fontSize={10} fill="#10b981">one wavelength λ</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Amplitude (loudness) <b>{amp}</b><Slider value={[amp]} min={2} max={12} step={1} onValueChange={([v]) => setAmp(v)} className="mt-1" aria-label="amplitude" /></label>
        <label className="text-sm">Wavelength <b>{lambdaCols} particle gaps</b><Slider value={[lambdaCols]} min={8} max={30} step={1} onValueChange={([v]) => setLambdaCols(v)} className="mt-1" aria-label="wavelength" /></label>
      </div>
      <Button className="mt-3" variant="outline" onClick={() => setRunning((r) => !r)}>{running ? '⏸ Pause' : '▶ Play'}</Button>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{mode === 'long' ? <>In a <b>longitudinal</b> wave the particles vibrate <b>parallel</b> to the direction the wave travels, making regions of high pressure (<b>compressions, C</b>) and low pressure (<b>rarefactions, R</b>). The wavelength is the distance from one compression to the next. The wave carries energy, not air: the red particle stays in the same place on average.</> : <>In a <b>transverse</b> wave the particles vibrate at <b>right angles</b> to the direction of travel, making crests and troughs. Sound in air can't do this: gases can only be squashed and stretched.</>}</p>
    </LabFrame>
  )
}
