import { useRef, type ReactNode } from 'react'
import type { Pt } from './coord'

type Props = {
  min?: number
  max?: number
  size?: number
  points?: { p: Pt; color: string; label: string; onMove?: (p: Pt) => void }[]
  children?: (X: (x: number) => number, Y: (y: number) => number) => ReactNode
  label: string
}

/** A square coordinate grid from min to max on both axes, with optional draggable points that snap to whole numbers. */
export function CoordGrid({ min = -8, max = 8, size = 320, points = [], children, label }: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const drag = useRef<number | null>(null)
  const pad = 14
  const s = (size - 2 * pad) / (max - min)
  const X = (x: number) => pad + (x - min) * s
  const Y = (y: number) => size - pad - (y - min) * s
  const toPt = (e: React.PointerEvent): Pt => {
    const r = svg.current!.getBoundingClientRect()
    const sx = ((e.clientX - r.left) / r.width) * size
    const sy = ((e.clientY - r.top) / r.height) * size
    const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v)))
    return { x: clamp((sx - pad) / s + min), y: clamp((size - pad - sy) / s + min) }
  }
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full touch-none rounded-2xl border bg-background select-none"
      role="img"
      aria-label={label}
      onPointerMove={(e) => { if (drag.current !== null) points[drag.current]?.onMove?.(toPt(e)) }}
      onPointerUp={() => { drag.current = null }}
      onPointerLeave={() => { drag.current = null }}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1={Y(min)} x2={X(t)} y2={Y(max)} stroke="currentColor" strokeOpacity={t === 0 ? 0.7 : 0.08} />
          <line x1={X(min)} y1={Y(t)} x2={X(max)} y2={Y(t)} stroke="currentColor" strokeOpacity={t === 0 ? 0.7 : 0.08} />
          {t !== 0 && t % 2 === 0 && <text x={X(t)} y={Y(0) + 11} textAnchor="middle" fontSize={8} fill="currentColor" opacity={0.6}>{t}</text>}
          {t !== 0 && t % 2 === 0 && <text x={X(0) - 4} y={Y(t) + 3} textAnchor="end" fontSize={8} fill="currentColor" opacity={0.6}>{t}</text>}
        </g>
      ))}
      <text x={X(max) - 2} y={Y(0) - 4} textAnchor="end" fontSize={10} fill="currentColor">x</text>
      <text x={X(0) + 4} y={Y(max) + 10} fontSize={10} fill="currentColor">y</text>
      {children?.(X, Y)}
      {points.map((pt, i) => (
        <g key={i} className={pt.onMove ? 'cursor-grab' : ''} onPointerDown={(e) => { if (!pt.onMove) return; drag.current = i; try { svg.current?.setPointerCapture(e.pointerId) } catch { /* synthetic events */ } }}>
          <circle cx={X(pt.p.x)} cy={Y(pt.p.y)} r={12} fill="transparent" />
          <circle cx={X(pt.p.x)} cy={Y(pt.p.y)} r={6} fill={pt.color} stroke="white" strokeWidth={2} />
          <text x={X(pt.p.x) + 8} y={Y(pt.p.y) - 8} fontSize={11} fontWeight={700} fill={pt.color}>{pt.label}({pt.p.x}, {pt.p.y})</text>
        </g>
      ))}
    </svg>
  )
}

/** Clip the line y = m x + c to the square [min, max]² and return its two ends. */
export function lineEnds(m: number, c: number, min: number, max: number): [Pt, Pt] {
  return [{ x: min, y: m * min + c }, { x: max, y: m * max + c }]
}
