import { SYNODIC } from './model'

/** The Moon as seen from India (northern hemisphere): waxing phases are lit on the right. */
export function moonPath(day: number, r: number) {
  const theta = (((day % SYNODIC) + SYNODIC) % SYNODIC) / SYNODIC * 2 * Math.PI
  const x = Math.abs(r * Math.cos(theta))
  if (theta <= Math.PI) {
    // right half lit; terminator bulges right (crescent) or left (gibbous)
    const sweep = theta < Math.PI / 2 ? 0 : 1
    return `M0 ${-r} A ${r} ${r} 0 0 1 0 ${r} A ${x} ${r} 0 0 ${sweep} 0 ${-r} Z`
  }
  // left half lit; terminator bulges right (gibbous: sweep 0) or left (crescent: sweep 1)
  const sweep = theta < (3 * Math.PI) / 2 ? 0 : 1
  return `M0 ${-r} A ${r} ${r} 0 0 0 0 ${r} A ${x} ${r} 0 0 ${sweep} 0 ${-r} Z`
}

export function MoonDisc({ day, r = 50, label }: { day: number; r?: number; label: string }) {
  return (
    <svg viewBox={`${-r - 4} ${-r - 4} ${2 * r + 8} ${2 * r + 8}`} className="w-full max-w-40" role="img" aria-label={label}>
      <circle r={r} fill="#1e293b" />
      <path d={moonPath(day, r)} fill="#f1f5f9" />
      <circle r={r} fill="none" stroke="#475569" />
    </svg>
  )
}
