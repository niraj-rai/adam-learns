import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { cssVar, setupCanvas, useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SPACING, classify, deflection } from './model'

type Model = 'plum' | 'nuclear'
const W = 520
const H = 300
const FOIL_X = 300

type Alpha = { x: number; y: number; vx: number; vy: number; hit: boolean; trail: [number, number][] }

export default function GoldFoil() {
  const [model, setModel] = useState<Model>('nuclear')
  const [running, setRunning] = useState(false)
  const [counts, setCounts] = useState({ straight: 0, small: 0, back: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const alphas = useRef<Alpha[]>([])
  const spawn = useRef(0)
  const tally = useRef({ straight: 0, small: 0, back: 0 })
  const acc = useRef(0)

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, W, H)
  }, [])

  const reset = (m: Model = model) => {
    alphas.current = []
    tally.current = { straight: 0, small: 0, back: 0 }
    setCounts({ straight: 0, small: 0, back: 0 })
    setModel(m)
  }

  useAnimationFrame((dt) => {
    const ctx = ctxRef.current
    if (!ctx) return
    if (running) {
      spawn.current += dt
      while (spawn.current > 0.05) {
        spawn.current -= 0.05
        alphas.current.push({ x: 0, y: 20 + Math.random() * (H - 40), vx: 260, vy: 0, hit: false, trail: [] })
      }
    }
    for (const a of alphas.current) {
      const before = a.x
      a.x += a.vx * dt
      a.y += a.vy * dt
      a.trail.push([a.x, a.y])
      if (a.trail.length > 18) a.trail.shift()
      if (!a.hit && before < FOIL_X && a.x >= FOIL_X) {
        a.hit = true
        let angle: number
        if (model === 'plum') {
          angle = (Math.random() - 0.5) * 0.03
        } else {
          // nearest nucleus in the column
          const nearest = Math.round((a.y - SPACING / 2) / SPACING) * SPACING + SPACING / 2
          const b = a.y - nearest
          angle = Math.sign(b || 1) * deflection(b)
        }
        const speed = Math.hypot(a.vx, a.vy)
        a.vx = speed * Math.cos(angle)
        a.vy = speed * Math.sin(angle)
        tally.current[classify(angle)]++
      }
    }
    alphas.current = alphas.current.filter((a) => a.x > -10 && a.x < W + 10 && a.y > -10 && a.y < H + 10)
    acc.current += dt
    if (acc.current > 0.2) {
      acc.current = 0
      setCounts({ ...tally.current })
    }

    // draw
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = cssVar('--muted', '#f4f4f5')
    ctx.fillRect(0, 0, W, H)
    // source
    ctx.fillStyle = '#475569'
    ctx.fillRect(0, H / 2 - 30, 14, 60)
    ctx.fillStyle = cssVar('--muted-foreground', '#666')
    ctx.font = '11px system-ui'
    ctx.fillText('α source', 18, H / 2 - 36)
    // foil atoms
    for (let y = SPACING / 2; y < H; y += SPACING) {
      if (model === 'plum') {
        ctx.beginPath()
        ctx.arc(FOIL_X, y, SPACING / 2 - 1, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.35)'
        ctx.fill()
        for (let k = 0; k < 4; k++) {
          ctx.beginPath()
          ctx.arc(FOIL_X - 8 + (k % 2) * 16, y - 6 + Math.floor(k / 2) * 12, 2, 0, Math.PI * 2)
          ctx.fillStyle = '#1d4ed8'
          ctx.fill()
        }
      } else {
        ctx.beginPath()
        ctx.arc(FOIL_X, y, SPACING / 2 - 1, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)'
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(FOIL_X, y, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = '#dc2626'
        ctx.fill()
      }
    }
    // alpha particles
    for (const a of alphas.current) {
      ctx.beginPath()
      a.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(a.x, a.y, 2.6, 0, Math.PI * 2)
      ctx.fillStyle = '#059669'
      ctx.fill()
    }
    ctx.fillStyle = cssVar('--muted-foreground', '#666')
    ctx.fillText('gold foil (zoomed in)', FOIL_X - 50, H - 6)
  })

  const total = counts.straight + counts.small + counts.back
  const pct = (n: number) => (total ? `${((n / total) * 100).toFixed(n / total < 0.01 ? 2 : 1)}%` : '—')

  return (
    <LabFrame
      labId="gold-foil"
      title="Rutherford's Gold Foil Experiment"
      subtitle="Fire alpha particles at gold foil. What does the atom look like inside?"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>First choose <b>Thomson's plum pudding model</b> and fire. This is what scientists EXPECTED to see.</li>
          <li>Then switch to the <b>nuclear model</b>. This matches what Rutherford's team REALLY saw in 1909.</li>
          <li>Watch the counters. Why would a few particles bounce straight back?</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {(['plum', 'nuclear'] as Model[]).map((m) => (
          <button key={m} type="button" onClick={() => reset(m)} className={cn('rounded-full border px-3 py-1.5 text-sm', model === m ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {m === 'plum' ? '🍮 Plum pudding model (expected)' : '⚛️ Nuclear model (what really happened)'}
          </button>
        ))}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', aspectRatio: `${W} / ${H}` }} className="rounded-xl border" role="img" aria-label={`Alpha particles hitting gold foil. ${counts.straight} passed straight through, ${counts.small} were deflected, ${counts.back} bounced back.`} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="lg" onClick={() => setRunning((r) => !r)}>{running ? '⏸ Stop firing' : '▶ Fire alpha particles'}</Button>
        <Button size="lg" variant="ghost" onClick={() => reset()}>Reset counters</Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Readout label="Straight through" value={`${counts.straight} (${pct(counts.straight)})`} />
        <Readout label="Deflected" value={`${counts.small} (${pct(counts.small)})`} />
        <Readout label="Bounced back" value={`${counts.back} (${pct(counts.back)})`} />
      </div>
      {total > 100 && (
        <p role="status" className="mt-3 rounded-xl bg-chem-soft px-4 py-3 text-sm">
          {model === 'plum'
            ? '🍮 In the plum pudding model, positive charge is spread thinly through the whole atom, so nothing is strong enough to turn an alpha particle around. Every particle goes (almost) straight through.'
            : '⚛️ Most particles go straight through: the atom is mostly EMPTY SPACE. A few are deflected, and a very few bounce back. They must have hit something tiny, heavy and positive: the NUCLEUS. Rutherford compared it to a huge artillery shell bouncing back off a sheet of tissue paper!'}
        </p>
      )}
    </LabFrame>
  )
}
