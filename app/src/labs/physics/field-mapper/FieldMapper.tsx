import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Source = 'bar' | 'wire' | 'solenoid'
const W = 320
const H = 240

/** Magnetic field direction at (x, y) for each source (unnormalised). */
function field(src: Source, x: number, y: number, dir: 1 | -1) {
  const cx = W / 2
  const cy = H / 2
  if (src === 'wire') {
    const dx = x - cx
    const dy = y - cy
    const r2 = dx * dx + dy * dy + 1
    // current out of the page (dir = 1) gives anticlockwise lines (right-hand thumb rule); screen y points down
    return { bx: (dir * dy) / r2, by: (-dir * dx) / r2 }
  }
  // bar magnet or solenoid: two poles (N at right for dir = 1)
  const half = src === 'bar' ? 45 : 60
  const poles = [{ x: cx + dir * half, q: 1 }, { x: cx - dir * half, q: -1 }]
  let bx = 0
  let by = 0
  for (const p of poles) {
    const dx = x - p.x
    const dy = y - cy
    const r3 = Math.pow(dx * dx + dy * dy + 30, 1.5)
    bx += (p.q * dx) / r3
    by += (p.q * dy) / r3
  }
  // inside the solenoid the field is uniform, from S to N
  if (src === 'solenoid' && Math.abs(x - cx) < half && Math.abs(y - cy) < 26) return { bx: dir * 1, by: 0 }
  return { bx, by }
}

export default function FieldMapper() {
  const [src, setSrc] = useState<Source>('wire')
  const [dir, setDir] = useState<1 | -1>(1)
  const pts = []
  for (let x = 20; x < W; x += 30) for (let y = 20; y < H; y += 30) pts.push({ x, y })
  return (
    <LabFrame labId="field-mapper" title="Magnetic Field Mapper" subtitle="Electric currents make magnetic fields. Compass needles show the direction of the field at each point." howTo={<p>Choose a source and reverse the current (or flip the magnet). Each compass needle points along the field: the red end points the way a north pole would be pushed.</p>}>
      <div className="flex flex-wrap items-center gap-1">
        {([['bar', '🧲 Bar magnet'], ['wire', '➖ Straight wire'], ['solenoid', '🌀 Solenoid (coil)']] as const).map(([k, l]) => <button key={k} type="button" aria-pressed={src === k} onClick={() => setSrc(k)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', src === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{l}</button>)}
        <button type="button" onClick={() => setDir((d) => (d === 1 ? -1 : 1))} className="ml-auto rounded-lg border-2 px-2.5 py-1 text-sm hover:bg-muted">🔄 {src === 'bar' ? 'Flip magnet' : 'Reverse current'}</button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Magnetic field around a ${src}`}>
        {src === 'wire' && <><circle cx={W / 2} cy={H / 2} r={10} fill="#f59e0b" stroke="#78350f" strokeWidth={2} />{dir === 1 ? <circle cx={W / 2} cy={H / 2} r={3} fill="#78350f" /> : <path d={`M${W / 2 - 5},${H / 2 - 5} l10,10 M${W / 2 + 5},${H / 2 - 5} l-10,10`} stroke="#78350f" strokeWidth={2} />}{[30, 55, 85].map((r) => <circle key={r} cx={W / 2} cy={H / 2} r={r} fill="none" stroke="#6366f1" strokeOpacity={0.35} strokeDasharray="4 4" />)}</>}
        {src === 'bar' && <g><rect x={W / 2 - 50} y={H / 2 - 12} width={50} height={24} fill={dir === 1 ? '#3b82f6' : '#ef4444'} /><rect x={W / 2} y={H / 2 - 12} width={50} height={24} fill={dir === 1 ? '#ef4444' : '#3b82f6'} /><text x={W / 2 - 25} y={H / 2 + 5} textAnchor="middle" fontSize={13} fill="white" fontWeight={700}>{dir === 1 ? 'S' : 'N'}</text><text x={W / 2 + 25} y={H / 2 + 5} textAnchor="middle" fontSize={13} fill="white" fontWeight={700}>{dir === 1 ? 'N' : 'S'}</text></g>}
        {src === 'solenoid' && <g>{Array.from({ length: 9 }, (_, k) => <ellipse key={k} cx={W / 2 - 60 + k * 15} cy={H / 2} rx={6} ry={28} fill="none" stroke="#b45309" strokeWidth={2.5} />)}<text x={W / 2 + dir * 76} y={H / 2 - 32} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ef4444">N</text><text x={W / 2 - dir * 76} y={H / 2 - 32} textAnchor="middle" fontSize={12} fontWeight={700} fill="#3b82f6">S</text></g>}
        {pts.map((p) => {
          const { bx, by } = field(src, p.x, p.y, dir)
          const a = Math.atan2(by, bx)
          const near = src === 'wire' ? Math.hypot(p.x - W / 2, p.y - H / 2) < 14 : src === 'bar' ? Math.abs(p.x - W / 2) < 55 && Math.abs(p.y - H / 2) < 16 : false
          if (near) return null
          const L = 10
          return <g key={`${p.x}-${p.y}`} transform={`translate(${p.x},${p.y}) rotate(${(a * 180) / Math.PI})`}><line x1={-L} y1={0} x2={0} y2={0} stroke="#64748b" strokeWidth={3} /><line x1={0} y1={0} x2={L} y2={0} stroke="#ef4444" strokeWidth={3} /></g>
        })}
      </svg>
      <p className="mt-3 rounded-xl bg-muted/60 px-4 py-2 text-sm">{src === 'wire' ? <>The field makes <b>circles</b> around the wire. <b>Right-hand thumb rule:</b> point your right thumb along the current; your curled fingers show the field direction. Current {dir === 1 ? 'out of the page (•): anticlockwise' : 'into the page (×): clockwise'}.</> : src === 'solenoid' ? <>A current-carrying coil acts like a bar magnet. Inside it the field is <b>strong and uniform</b> (parallel lines). Put soft iron inside and you get an <b>electromagnet</b>.</> : <>Field lines leave the <b>north</b> pole and enter the <b>south</b> pole. They never cross, and they are closest together where the field is strongest.</>}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Hans Christian Ørsted discovered in 1820 that a current deflects a compass needle: the first link between electricity and magnetism. The field around a straight wire gets weaker the further you go, and stronger if the current increases.</p>
    </LabFrame>
  )
}
