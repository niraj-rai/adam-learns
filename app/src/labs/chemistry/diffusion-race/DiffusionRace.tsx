import { Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { cssVar, randn, setupCanvas, useAnimationFrame } from '../../_kit/canvas'
import { LabFrame } from '../../_kit/LabFrame'

type Medium = 'water' | 'air'
type Setup = { temperature: number; medium: Medium }

const W = 220
const H = 260
const DYE = 260
const GRID = 6

type Dot = { x: number; y: number }

/**
 * Random-walk step size ∝ √(diffusivity). Diffusivity grows with temperature (faster particles, and
 * water gets less viscous when hot), and is far larger in a gas. Time is sped up so a race takes seconds.
 */
function stepSize({ temperature, medium }: Setup) {
  const kelvin = temperature + 273
  if (medium === 'air') return 20 * Math.sqrt(kelvin / 293)
  const relativeViscosity = Math.exp(-0.0228 * (temperature - 20))
  return 5 * Math.sqrt(kelvin / 293 / relativeViscosity)
}

function mixedPercent(dots: Dot[]) {
  const counts = new Array(GRID * GRID).fill(0)
  for (const d of dots) {
    const cx = Math.min(GRID - 1, Math.floor((d.x / W) * GRID))
    const cy = Math.min(GRID - 1, Math.floor((d.y / H) * GRID))
    counts[cy * GRID + cx]++
  }
  const expected = dots.length / counts.length
  const filled = counts.filter((c) => c >= expected * 0.5).length
  return Math.round((filled / counts.length) * 100)
}

const freshDots = (): Dot[] => Array.from({ length: DYE }, () => ({ x: W / 2 + randn() * 5, y: 30 + randn() * 5 }))

function Beaker({
  label,
  setup,
  onChange,
  running,
  resetKey,
  onFinish,
  locked,
}: {
  label: string
  setup: Setup
  onChange: (s: Setup) => void
  running: boolean
  resetKey: number
  onFinish: (seconds: number) => void
  locked: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const dots = useRef<Dot[]>(freshDots())
  const time = useRef(0)
  const finished = useRef(false)
  const [mixed, setMixed] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, W, H)
  }, [])

  useEffect(() => {
    dots.current = freshDots()
    time.current = 0
    finished.current = false
    setMixed(0)
    setElapsed(0)
  }, [resetKey])

  useAnimationFrame((dt) => {
    const ctx = ctxRef.current
    if (!ctx) return
    if (running && !finished.current) {
      time.current += dt
      const s = stepSize(setup) * Math.sqrt(dt * 60)
      for (const d of dots.current) {
        d.x += randn() * s
        d.y += randn() * s
        if (d.x < 3) d.x = 6 - d.x
        if (d.x > W - 3) d.x = 2 * (W - 3) - d.x
        if (d.y < 3) d.y = 6 - d.y
        if (d.y > H - 3) d.y = 2 * (H - 3) - d.y
      }
      const m = mixedPercent(dots.current)
      setMixed(m)
      setElapsed(time.current)
      if (m >= 90) {
        finished.current = true
        onFinish(time.current)
      }
    }
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = setup.medium === 'water' ? (setup.temperature > 40 ? 'rgba(251,146,60,0.12)' : 'rgba(56,189,248,0.14)') : 'rgba(148,163,184,0.08)'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = cssVar('--border', '#ddd')
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, W - 2, H - 2)
    ctx.fillStyle = '#c026d3'
    for (const d of dots.current) {
      ctx.beginPath()
      ctx.arc(d.x, d.y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  })

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-background p-3">
      <p className="font-heading font-semibold">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {(['water', 'air'] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={locked}
            onClick={() => onChange({ ...setup, medium: m })}
            className={cn('rounded-full border px-2.5 py-0.5 text-xs disabled:opacity-60', setup.medium === m && 'border-chem bg-chem-soft font-semibold')}
          >
            {m === 'water' ? '💧 in water' : '💨 in air'}
          </button>
        ))}
        {[10, 30, 70].map((t) => (
          <button
            key={t}
            type="button"
            disabled={locked}
            onClick={() => onChange({ ...setup, temperature: t })}
            className={cn('rounded-full border px-2.5 py-0.5 text-xs disabled:opacity-60', setup.temperature === t && 'border-chem bg-chem-soft font-semibold')}
          >
            {t === 10 ? '🧊' : t === 30 ? '🌤️' : '🔥'} {t} °C
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', aspectRatio: `${W} / ${H}` }} className="rounded-lg" role="img" aria-label={`${label}: ${mixed}% mixed after ${elapsed.toFixed(1)} seconds`} />
      <div className="flex justify-between text-sm">
        <span>
          Mixed: <b className="tabular-nums">{mixed}%</b>
        </span>
        <span className="tabular-nums text-muted-foreground">{elapsed.toFixed(1)} s</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-fuchsia-500 transition-[width]" style={{ width: `${mixed}%` }} />
      </div>
    </div>
  )
}

export default function DiffusionRace() {
  const [a, setA] = useState<Setup>({ temperature: 10, medium: 'water' })
  const [b, setB] = useState<Setup>({ temperature: 70, medium: 'water' })
  const [running, setRunning] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [results, setResults] = useState<{ a?: number; b?: number }>({})
  const [prediction, setPrediction] = useState<'A' | 'B' | 'same' | null>(null)

  const changed = [a.temperature !== b.temperature && 'temperature', a.medium !== b.medium && 'medium'].filter(Boolean) as string[]
  const fairTest = changed.length === 1
  const bothDone = results.a !== undefined && results.b !== undefined
  const winner = bothDone ? (Math.abs(results.a! - results.b!) < 0.6 ? 'same' : results.a! < results.b! ? 'A' : 'B') : null

  const reset = () => {
    setRunning(false)
    setResults({})
    setResetKey((k) => k + 1)
  }

  return (
    <LabFrame
      labId="diffusion-race"
      title="Diffusion Race"
      subtitle="Which drop of dye spreads out faster?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Set up beaker A and beaker B. For a <b>fair test</b>, change only <b>one</b> variable.</li>
          <li>Make your prediction, then press <b>Drop the dye!</b></li>
          <li>The race ends when a beaker is 90% mixed.</li>
        </ul>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Beaker label="Beaker A" setup={a} onChange={(s) => { setA(s); reset() }} running={running} resetKey={resetKey} locked={running} onFinish={(t) => setResults((r) => ({ ...r, a: t }))} />
        <Beaker label="Beaker B" setup={b} onChange={(s) => { setB(s); reset() }} running={running} resetKey={resetKey} locked={running} onFinish={(t) => setResults((r) => ({ ...r, b: t }))} />
      </div>

      <div className={cn('mt-3 rounded-xl border px-3 py-2 text-sm', fairTest ? 'border-success/40 bg-success-soft' : 'border-warn/50 bg-warn-soft')}>
        {changed.length === 0 && '⚖️ Both beakers are the same. Change one variable to test its effect.'}
        {fairTest && (
          <>
            ✅ <b>Fair test.</b> Independent variable: <b>{changed[0]}</b>. Dependent variable: <b>time to mix</b>. Controlled: amount of dye, beaker size
            {changed[0] === 'temperature' ? ', medium' : ', temperature'}.
          </>
        )}
        {changed.length > 1 && '⚠️ You changed two variables at once. If one beaker wins, you will not know which change caused it (IB Criterion B).'}
      </div>

      {!running && !bothDone && (
        <div className="mt-3">
          <p className="mb-2 text-sm font-semibold">🔮 Predict: which beaker will mix first?</p>
          <div className="flex flex-wrap gap-2">
            {(['A', 'B', 'same'] as const).map((p) => (
              <Button key={p} variant={prediction === p ? 'default' : 'outline'} onClick={() => setPrediction(p)}>
                {p === 'same' ? 'About the same' : `Beaker ${p}`}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button size="lg" onClick={() => setRunning(true)} disabled={running || !prediction}>
          <Play /> Drop the dye!
        </Button>
        <Button size="lg" variant="ghost" onClick={reset}>
          <RotateCcw /> Reset
        </Button>
      </div>

      {bothDone && (
        <div role="status" className="mt-3 rounded-xl border bg-chem-soft px-4 py-3 text-sm">
          <p className="font-semibold">
            {winner === 'same' ? 'It was a tie!' : `Beaker ${winner} mixed first!`}{' '}
            {prediction && (prediction === winner ? '🎯 Your prediction was right.' : '🤔 Different from your prediction. That is how scientists learn!')}
          </p>
          <p className="mt-1 text-muted-foreground">
            A: {results.a!.toFixed(1)} s · B: {results.b!.toFixed(1)} s. Particles move <b>faster when hotter</b>, and move much more <b>freely in a gas</b>,
            where there is lots of space between particles.
          </p>
        </div>
      )}
    </LabFrame>
  )
}
