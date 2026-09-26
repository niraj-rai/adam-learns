import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { compass, displacement, distance, path, type Dir } from './model'

const G = 5 // grid runs from -G to G blocks
const S = 28
const STEP_M = 100
const STEP_S = 80 // seconds to walk one 100 m block
const SCHOOL: [number, number] = [3, 4]

export default function DisplacementWalker() {
  const [steps, setSteps] = useState<Dir[]>([])
  const pts = path(steps)
  const [x, y] = pts.at(-1)!
  const d = displacement(steps, STEP_M)
  const dist = distance(steps, STEP_M)
  const time = steps.length * STEP_S
  const X = (v: number) => (v + G) * S + 10
  const Y = (v: number) => (G - v) * S + 10
  const atSchool = x === SCHOOL[0] && y === SCHOOL[1]
  const go = (dir: Dir) => {
    const D: Record<Dir, [number, number]> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] }
    const nx = x + D[dir][0]
    const ny = y + D[dir][1]
    if (Math.abs(nx) > G || Math.abs(ny) > G || steps.length >= 30) return
    setSteps((s) => [...s, dir])
    if (nx === SCHOOL[0] && ny === SCHOOL[1]) sfx.correct()
    else sfx.click()
  }
  return (
    <LabFrame labId="displacement-walker" title="Distance vs Displacement" subtitle="Walk the streets to school. How far did you walk, and how far did you actually get?" howTo={<p>Use the arrows to walk block by block (each block is 100 m and takes 80 s). The blue line is your path (distance); the red arrow is your displacement: straight from start to finish, with a direction.</p>}>
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <svg viewBox={`0 0 ${2 * G * S + 20} ${2 * G * S + 20}`} className="w-full max-w-sm rounded-2xl border bg-background" role="img" aria-label={`Walked ${dist} m; displacement ${Math.round(d.mag)} m ${compass(d.bearing)}`}>
          <defs><marker id="dw-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" /></marker></defs>
          {Array.from({ length: 2 * G + 1 }, (_, i) => (
            <g key={i}>
              <line x1={X(i - G)} y1={Y(G)} x2={X(i - G)} y2={Y(-G)} stroke="currentColor" strokeOpacity={0.12} strokeWidth={6} />
              <line x1={X(-G)} y1={Y(i - G)} x2={X(G)} y2={Y(i - G)} stroke="currentColor" strokeOpacity={0.12} strokeWidth={6} />
            </g>
          ))}
          <text x={X(0)} y={Y(0) + 5} textAnchor="middle" fontSize={16}>🏠</text>
          <text x={X(SCHOOL[0])} y={Y(SCHOOL[1]) + 5} textAnchor="middle" fontSize={16}>🏫</text>
          <polyline points={pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')} fill="none" stroke="#6366f1" strokeWidth={3} strokeLinejoin="round" />
          {d.mag > 0 && <line x1={X(0)} y1={Y(0)} x2={X(x)} y2={Y(y)} stroke="#ef4444" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#dw-arrow)" />}
          <circle cx={X(x)} cy={Y(y)} r={7} fill="#f59e0b" stroke="white" strokeWidth={2} />
          <text x={X(G) - 4} y={Y(G) + 12} textAnchor="end" fontSize={11} fill="currentColor">N ↑</text>
        </svg>
        <div className="space-y-3">
          <div className="grid w-40 grid-cols-3 gap-1">
            <span />
            <Button variant="outline" onClick={() => go('N')} aria-label="Walk north">↑ N</Button>
            <span />
            <Button variant="outline" onClick={() => go('W')} aria-label="Walk west">← W</Button>
            <Button variant="ghost" onClick={() => setSteps([])}>↺</Button>
            <Button variant="outline" onClick={() => go('E')} aria-label="Walk east">E →</Button>
            <span />
            <Button variant="outline" onClick={() => go('S')} aria-label="Walk south">↓ S</Button>
            <span />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Distance (scalar)" value={`${dist} m`} />
            <Readout label="Displacement (vector)" value={d.mag ? `${Math.round(d.mag)} m towards ${compass(d.bearing)} (${Math.round(d.bearing)}°)` : '0 m'} />
            <Readout label="Average speed" value={time ? `${dist} ÷ ${time} = ${(dist / time).toFixed(2)} m/s` : '—'} />
            <Readout label="Average velocity" value={!time ? '—' : d.mag ? `${(d.mag / time).toFixed(2)} m/s towards ${compass(d.bearing)}` : '0 m/s (back where you started)'} />
          </div>
          <p className="rounded-xl bg-chem-soft px-3 py-2 text-sm">
            {atSchool
              ? <>🏫 You reached school! Any route along the streets is at least 700 m, but the displacement is always <b>500 m</b> (3–4–5 triangle!). Try a round trip back home: distance keeps growing, displacement drops to 0.</>
              : <><b>Distance</b> is the total path length (just a size: a scalar). <b>Displacement</b> is the change in position, with a size <i>and</i> a direction (a vector). Walk to the school 🏫 to compare.</>}
          </p>
        </div>
      </div>
    </LabFrame>
  )
}
