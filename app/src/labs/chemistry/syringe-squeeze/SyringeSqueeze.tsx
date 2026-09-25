import { useEffect, useRef, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cssVar, randn, setupCanvas, useAnimationFrame } from '../../_kit/canvas'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const W = 520
const ROW_H = 100
const H = ROW_H * 3
const BARREL_X = 70
const BARREL_LEN = 360
const R = 6

type Kind = 'solid' | 'liquid' | 'gas'
const ROWS: { kind: Kind; label: string; color: string }[] = [
  { kind: 'solid', label: 'Solid (wax)', color: '#f59e0b' },
  { kind: 'liquid', label: 'Liquid (water)', color: '#38bdf8' },
  { kind: 'gas', label: 'Gas (air)', color: '#a3a3a3' },
]

type P = { x: number; y: number; vx: number; vy: number; seed: number }

/** Relative volume (1 = start) for a push force 0–100. Gas follows Boyle's law; liquids and solids barely change. */
function volumeFraction(kind: Kind, force: number) {
  if (kind === 'gas') return 1 / (1 + force / 40)
  if (kind === 'liquid') return 1 - force * 0.00005
  return 1
}

function makeParticles(kind: Kind, row: number): P[] {
  const top = row * ROW_H + 30
  const inner = 48
  const ps: P[] = []
  if (kind === 'gas') {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2
      ps.push({ x: BARREL_X + 10 + Math.random() * (BARREL_LEN - 20), y: top + 6 + Math.random() * (inner - 12), vx: Math.cos(a) * 120, vy: Math.sin(a) * 120, seed: Math.random() * 100 })
    }
    return ps
  }
  const spacing = kind === 'solid' ? 2 * R + 0.5 : 2 * R + 2.5
  const rows = Math.floor(inner / spacing)
  const cols = Math.floor((BARREL_LEN - 4) / spacing)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = kind === 'liquid' && r % 2 ? spacing / 2 : 0
      ps.push({ x: BARREL_X + R + 2 + c * spacing + offset, y: top + R + 2 + r * spacing, vx: 0, vy: 0, seed: Math.random() * 100 })
    }
  }
  return ps
}

export default function SyringeSqueeze() {
  const [force, setForce] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const particles = useRef(ROWS.map((r, i) => makeParticles(r.kind, i)))
  const home = useRef(particles.current.map((ps) => ps.map((p) => ({ x: p.x, y: p.y }))))

  useEffect(() => {
    if (canvasRef.current) ctxRef.current = setupCanvas(canvasRef.current, W, H)
  }, [])

  useAnimationFrame((dt, time) => {
    const ctx = ctxRef.current
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    const fg = cssVar('--foreground', '#111')
    const border = cssVar('--muted-foreground', '#888')

    ROWS.forEach((row, i) => {
      const top = i * ROW_H + 30
      const inner = 48
      const frac = volumeFraction(row.kind, force)
      const plungerX = BARREL_X + BARREL_LEN * frac

      ctx.fillStyle = fg
      ctx.font = '600 13px system-ui'
      ctx.fillText(row.label, BARREL_X, top - 10)

      // barrel
      ctx.strokeStyle = border
      ctx.lineWidth = 2
      ctx.strokeRect(BARREL_X, top, BARREL_LEN + 30, inner)
      // sealed nozzle
      ctx.fillStyle = border
      ctx.fillRect(BARREL_X - 18, top + inner / 2 - 5, 18, 10)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(BARREL_X - 24, top + inner / 2 - 8, 6, 16)
      // plunger
      ctx.fillStyle = cssVar('--primary', '#0d9488')
      ctx.fillRect(plungerX, top + 2, 8, inner - 4)
      ctx.fillRect(plungerX + 8, top + inner / 2 - 3, W - plungerX - 40, 6)
      ctx.fillRect(W - 34, top + 4, 8, inner - 8)
      // push arrow
      if (force > 0) {
        ctx.fillStyle = '#f97316'
        ctx.font = '600 18px system-ui'
        ctx.fillText('👉', W - 26, top + inner / 2 + 6)
      }

      const ps = particles.current[i]
      const homes = home.current[i]
      const left = BARREL_X + R + 1
      const right = plungerX - R - 1
      const yTop = top + R + 1
      const yBot = top + inner - R - 1

      for (let k = 0; k < ps.length; k++) {
        const p = ps[k]
        if (row.kind === 'gas') {
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.x < left) (p.x = left), (p.vx = Math.abs(p.vx))
          if (p.x > right) (p.x = right), (p.vx = -Math.abs(p.vx))
          if (p.y < yTop) (p.y = yTop), (p.vy = Math.abs(p.vy))
          if (p.y > yBot) (p.y = yBot), (p.vy = -Math.abs(p.vy))
        } else {
          const amp = row.kind === 'solid' ? 0.8 : 1.8
          p.x = Math.min(right, homes[k].x + amp * Math.sin(time * 14 + p.seed) + (row.kind === 'liquid' ? randn() * 0.4 : 0))
          p.y = homes[k].y + amp * Math.cos(time * 17 + p.seed * 2)
        }
        ctx.beginPath()
        ctx.arc(p.x, p.y, R, 0, Math.PI * 2)
        ctx.fillStyle = row.color
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })
  })

  const gasV = volumeFraction('gas', force)

  return (
    <LabFrame
      labId="syringe-squeeze"
      title="Syringe Squeeze"
      subtitle="Push the plungers. Which state can be compressed?"
      howTo={<p>Each syringe is sealed at the tip. Drag the slider to push all three plungers with the same force.</p>}
    >
      <canvas ref={canvasRef} style={{ width: '100%', aspectRatio: `${W} / ${H}` }} role="img" aria-label={`Push force ${force}. The gas syringe is squeezed to ${Math.round(gasV * 100)}% of its volume; the liquid and solid do not change.`} />
      <div className="mt-3 space-y-2">
        <p className="text-sm font-semibold">Push force: {force}</p>
        <Slider value={[force]} min={0} max={100} step={1} onValueChange={([v]) => setForce(v)} aria-label="Push force" className="[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Readout label="Solid volume" value="100%" />
        <Readout label="Liquid volume" value={`${(volumeFraction('liquid', force) * 100).toFixed(1)}%`} />
        <Readout label="Gas volume" value={`${Math.round(gasV * 100)}%`} />
      </div>
      {force > 60 && (
        <p role="status" className="mt-3 rounded-xl border bg-chem-soft px-4 py-3 text-sm">
          🧐 Only the gas squashes! Gas particles have <b>large spaces</b> between them, so pushing moves them closer together. In liquids and solids
          the particles are <b>already touching</b>, so there is almost no space to remove. That is why LPG can be squeezed into a small cylinder.
        </p>
      )}
    </LabFrame>
  )
}
