import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { MATERIALS, type Part, type Result } from './model'

const W = 380
const H = 200
const L = 40
const R = W - 40
const T = 40
const B = H - 40
/** Six slots around a rectangular loop: top ×2, right, bottom ×2, left. */
const SLOTS = [
  { x: 140, y: T, rot: 0 },
  { x: 240, y: T, rot: 0 },
  { x: R, y: H / 2, rot: 90 },
  { x: 240, y: B, rot: 180 },
  { x: 140, y: B, rot: 180 },
  { x: L, y: H / 2, rot: 270 },
]

function Symbol({ part, result }: { part: Part; result: Result }) {
  switch (part.type) {
    case 'wire':
      return null
    case 'cell':
      return (
        <g transform={part.reversed ? 'scale(-1 1)' : undefined}>
          <rect x={-14} y={-16} width={28} height={32} fill="var(--card)" />
          <line x1={-5} y1={-14} x2={-5} y2={14} stroke="currentColor" strokeWidth={2} />
          <line x1={5} y1={-7} x2={5} y2={7} stroke="currentColor" strokeWidth={5} />
          <text x={-10} y={-18} fontSize={10} textAnchor="middle" className="fill-foreground">+</text>
          {part.dead && <text x={0} y={30} fontSize={9} textAnchor="middle" fill="#ef4444">dead</text>}
        </g>
      )
    case 'bulb': {
      const glow = Math.min(1, result.bulb / 2)
      return (
        <g>
          {glow > 0 && <circle r={14 + glow * 16} fill="#fde047" opacity={0.25 + glow * 0.4} />}
          <circle r={13} fill={glow > 0 ? '#fef08a' : 'var(--card)'} stroke="currentColor" strokeWidth={2} />
          {part.fused ? (
            <path d="M-8 -8 L-2 0 M2 0 L8 8" stroke="#ef4444" strokeWidth={2} />
          ) : (
            <path d="M-9 -9 L9 9 M9 -9 L-9 9" stroke="currentColor" strokeWidth={1.5} />
          )}
        </g>
      )
    }
    case 'led':
      return (
        <g transform={part.reversed ? 'scale(-1 1)' : undefined}>
          <rect x={-14} y={-14} width={28} height={28} fill="var(--card)" />
          {result.ledOn && <circle r={18} fill="#ef4444" opacity={0.35} />}
          <polygon points="-8,-9 -8,9 7,0" fill={result.ledOn ? '#ef4444' : 'var(--card)'} stroke="currentColor" strokeWidth={1.8} />
          <line x1={8} y1={-9} x2={8} y2={9} stroke="currentColor" strokeWidth={2} />
          <path d="M2 -12 l5 -6 M7 -12 l5 -6" stroke="currentColor" strokeWidth={1} />
        </g>
      )
    case 'switch':
      return (
        <g>
          <rect x={-16} y={-14} width={32} height={20} fill="var(--card)" />
          <circle cx={-12} cy={0} r={2.5} fill="currentColor" />
          <circle cx={12} cy={0} r={2.5} fill="currentColor" />
          <line x1={-12} y1={0} x2={part.closed ? 12 : 9} y2={part.closed ? 0 : -12} stroke="currentColor" strokeWidth={2} />
        </g>
      )
    case 'material': {
      const m = MATERIALS.find((x) => x.id === part.id)!
      return (
        <g>
          <rect x={-18} y={-12} width={36} height={24} rx={4} fill="var(--card)" stroke={m.conductor ? '#16a34a' : '#ef4444'} strokeDasharray="3 2" />
          <text y={5} fontSize={14} textAnchor="middle">{m.emoji}</text>
        </g>
      )
    }
  }
}

export function CircuitLoop({ parts, result, selected, onSlot, label }: { parts: Part[]; result: Result; selected?: number | null; onSlot?: (i: number) => void; label: string }) {
  const works = result.reason === 'works'
  const speed = Math.max(0.6, 4 - result.current * 6)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl border bg-background text-foreground" role="img" aria-label={label}>
      <rect x={L} y={T} width={R - L} height={B - T} fill="none" stroke="currentColor" strokeOpacity={0.7} strokeWidth={2} />
      {works && (
        <motion.rect x={L} y={T} width={R - L} height={B - T} fill="none" stroke="#f59e0b" strokeWidth={3} strokeDasharray="4 14" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -180 }} transition={{ repeat: Infinity, duration: speed, ease: 'linear' }} />
      )}
      {SLOTS.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y})`} onClick={() => onSlot?.(i)} className={cn(onSlot && 'cursor-pointer')}>
          <rect x={-24} y={-24} width={48} height={48} rx={8} fill={selected === i ? 'var(--chem-soft)' : 'transparent'} stroke={selected === i ? 'var(--chem)' : 'transparent'} />
          <g transform={`rotate(${s.rot})`}>{parts[i] && <Symbol part={parts[i]} result={result} />}</g>
        </g>
      ))}
    </svg>
  )
}
