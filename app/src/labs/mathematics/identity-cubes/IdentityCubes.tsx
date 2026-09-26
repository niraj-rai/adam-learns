import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

/** Isometric projection of a box at (x, y, z) with size (w, d, h). */
function Box({ x, y, z, w, d, h, color, S }: { x: number; y: number; z: number; w: number; d: number; h: number; color: string; S: number }) {
  const P = (px: number, py: number, pz: number) => `${160 + (px - py) * S * 0.87},${200 - (px + py) * S * 0.5 - pz * S}`
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)].join(' ')
  const left = [P(x, y, z), P(x, y, z + h), P(x, y + d, z + h), P(x, y + d, z)].join(' ')
  const right = [P(x, y, z), P(x + w, y, z), P(x + w, y, z + h), P(x, y, z + h)].join(' ')
  return <g stroke="#1e293b" strokeWidth={1}><polygon points={left} fill={color} opacity={0.75} /><polygon points={right} fill={color} opacity={0.9} /><polygon points={top} fill={color} /></g>
}

export default function IdentityCubes() {
  const [tab, setTab] = useState<'cube' | 'square3'>('cube')
  const [a, setA] = useState(3)
  const [b, setB] = useState(2)
  const [c, setC] = useState(1)
  const S = 60 / (a + b)
  const pieces = [
    { x: 0, y: 0, z: 0, w: a, d: a, h: a, color: '#6366f1', label: 'a³' },
    { x: a, y: 0, z: 0, w: b, d: a, h: a, color: '#f59e0b', label: 'a²b' },
    { x: 0, y: a, z: 0, w: a, d: b, h: a, color: '#f59e0b', label: 'a²b' },
    { x: 0, y: 0, z: a, w: a, d: a, h: b, color: '#f59e0b', label: 'a²b' },
    { x: a, y: a, z: 0, w: b, d: b, h: a, color: '#10b981', label: 'ab²' },
    { x: a, y: 0, z: a, w: b, d: a, h: b, color: '#10b981', label: 'ab²' },
    { x: 0, y: a, z: a, w: a, d: b, h: b, color: '#10b981', label: 'ab²' },
    { x: a, y: a, z: a, w: b, d: b, h: b, color: '#ec4899', label: 'b³' },
  ]
  // painter's order: back to front
  const order = [...pieces].sort((p, q) => (p.x + p.y + p.z) - (q.x + q.y + q.z))
  const lhs = (a + b) ** 3
  const sq = (a + b + c) ** 2
  return (
    <LabFrame labId="identity-cubes" title="Identity Builder" subtitle="See algebraic identities as shapes: a big cube cut into 8 blocks, and a square cut into 9 rectangles." howTo={<p>Change a and b (and c) and watch the pieces. Check that the pieces always add up to the whole.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['cube', '(a + b)³'], ['square3', '(a + b + c)²']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1 font-mono', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">a = <b>{a}</b><Slider value={[a]} min={1} max={6} step={1} onValueChange={([v]) => setA(v)} className="mt-1" aria-label="a" /></label>
        <label className="text-sm">b = <b>{b}</b><Slider value={[b]} min={1} max={6} step={1} onValueChange={([v]) => setB(v)} className="mt-1" aria-label="b" /></label>
        {tab === 'square3' && <label className="text-sm">c = <b>{c}</b><Slider value={[c]} min={1} max={6} step={1} onValueChange={([v]) => setC(v)} className="mt-1" aria-label="c" /></label>}
      </div>
      {tab === 'cube' ? (
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 320 240" className="w-full rounded-2xl border bg-background" role="img" aria-label="A cube of side a + b split into 8 blocks">
            {order.map((p, i) => <Box key={i} {...p} S={S} />)}
          </svg>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-base">(a + b)³ = <span className="text-indigo-500">a³</span> + <span className="text-amber-500">3a²b</span> + <span className="text-emerald-500">3ab²</span> + <span className="text-pink-500">b³</span></p>
            <p className="font-mono">({a} + {b})³ = {a ** 3} + {3 * a * a * b} + {3 * a * b * b} + {b ** 3} = <b>{a ** 3 + 3 * a * a * b + 3 * a * b * b + b ** 3}</b></p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Readout label="Whole cube (a + b)³" value={lhs} />
              <Readout label="Sum of the 8 pieces" value={a ** 3 + 3 * a * a * b + 3 * a * b * b + b ** 3} />
            </div>
            <p className="text-muted-foreground">1 blue cube a³, 3 orange slabs a²b, 3 green rods ab² and 1 pink cube b³. Also: (a − b)³ = a³ − 3a²b + 3ab² − b³.</p>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
          <svg viewBox="0 0 240 240" className="mx-auto w-full max-w-[260px] rounded-2xl border bg-background" role="img" aria-label="A square of side a + b + c split into 9 rectangles">
            {(() => {
              const t = a + b + c
              const k = 220 / t
              const sides = [a, b, c]
              const names = ['a', 'b', 'c']
              const cols = ['#6366f1', '#f59e0b', '#10b981']
              let y = 10
              return sides.map((h, i) => {
                let x = 10
                const row = sides.map((w, j) => {
                  const el = <g key={`${i}${j}`}><rect x={x} y={y} width={w * k} height={h * k} fill={i === j ? cols[i] : '#e2e8f0'} stroke="#1e293b" /><text x={x + (w * k) / 2} y={y + (h * k) / 2 + 4} textAnchor="middle" fontSize={11} fill={i === j ? 'white' : '#1e293b'}>{i === j ? `${names[i]}²` : `${names[Math.min(i, j)]}${names[Math.max(i, j)]}`}</text></g>
                  x += w * k
                  return el
                })
                y += h * k
                return row
              })
            })()}
          </svg>
          <div className="space-y-2 text-sm">
            <p className="font-mono text-base">(a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ca</p>
            <p className="font-mono">= {a * a} + {b * b} + {c * c} + {2 * a * b} + {2 * b * c} + {2 * c * a} = <b>{a * a + b * b + c * c + 2 * a * b + 2 * b * c + 2 * c * a}</b></p>
            <Readout label={`(${a} + ${b} + ${c})²`} value={sq} />
            <p className="text-muted-foreground">Three coloured squares on the diagonal, and each grey rectangle appears twice: that's where the 2ab, 2bc and 2ca come from.</p>
          </div>
        </div>
      )}
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Identities are true for <b>every</b> value of the variables. Another useful one: a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ca). So if a + b + c = 0, then a³ + b³ + c³ = 3abc.</p>
    </LabFrame>
  )
}
