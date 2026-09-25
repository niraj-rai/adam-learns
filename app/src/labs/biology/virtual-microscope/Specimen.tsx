import { useMemo } from 'react'
import type { SpecimenId } from './model'

/** Deterministic pseudo-random numbers so a slide looks the same every time. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Draws a specimen in micrometre units, centred on (0, 0).
 * `stained` reveals nuclei and walls; `radius` is how far from the centre to draw scattered cells.
 */
export function Specimen({ id, stained, radius }: { id: SpecimenId; stained: boolean; radius: number }) {
  const scattered = useMemo(() => {
    const r = rng({ onion: 1, cheek: 2, hydrilla: 3, bacteria: 4, blood: 5, neuron: 6 }[id] * 7919)
    const pts = (n: number, spread: number) => Array.from({ length: n }, () => ({ x: (r() * 2 - 1) * spread, y: (r() * 2 - 1) * spread, a: r() * 180, s: 0.8 + r() * 0.4 }))
    if (id === 'cheek') return pts(220, 1600)
    if (id === 'bacteria') return pts(900, 140)
    if (id === 'neuron') return pts(7, 700)
    return []
  }, [id])

  if (id === 'onion') {
    return (
      <g>
        <defs>
          <pattern id="onion" width={240} height={120} patternUnits="userSpaceOnUse">
            {[0, 1].map((row) => (
              <g key={row} transform={`translate(${row ? -120 : 0} ${row * 60})`}>
                {[0, 1, 2].map((c) => (
                  <g key={c}>
                    <rect x={c * 240 + 1} y={1} width={238} height={58} rx={4} fill={stained ? '#fde68a' : '#f8fafc'} stroke={stained ? '#a16207' : '#cbd5e1'} strokeWidth={stained ? 2.5 : 1.2} />
                    <ellipse cx={c * 240 + 70 + row * 60} cy={30} rx={11} ry={8} fill={stained ? '#92400e' : '#e2e8f0'} opacity={stained ? 0.9 : 0.35} />
                  </g>
                ))}
              </g>
            ))}
          </pattern>
        </defs>
        <circle r={radius} fill="url(#onion)" />
      </g>
    )
  }
  if (id === 'hydrilla') {
    return (
      <g>
        <defs>
          <pattern id="hydrilla" width={45} height={60} patternUnits="userSpaceOnUse">
            {[0, 1].map((row) => (
              <g key={row} transform={`translate(${row ? -22.5 : 0} ${row * 30})`}>
                {[0, 1, 2].map((c) => (
                  <g key={c}>
                    <rect x={c * 45 + 0.5} y={0.5} width={44} height={29} rx={2} fill="#ecfccb" stroke="#65a30d" strokeWidth={1} />
                    {[[8, 6], [20, 5], [33, 8], [10, 20], [24, 22], [36, 19], [16, 13], [30, 14]].map(([x, y], k) => (
                      <ellipse key={k} cx={c * 45 + x} cy={y} rx={2.6} ry={1.8} fill="#16a34a" />
                    ))}
                  </g>
                ))}
              </g>
            ))}
          </pattern>
        </defs>
        <circle r={radius} fill="url(#hydrilla)" />
      </g>
    )
  }
  if (id === 'blood') {
    return (
      <g>
        <defs>
          <radialGradient id="rbc">
            <stop offset="0" stopColor="#fecaca" />
            <stop offset="0.45" stopColor="#fca5a5" />
            <stop offset="1" stopColor="#dc2626" />
          </radialGradient>
          <pattern id="blood" width={36} height={36} patternUnits="userSpaceOnUse">
            {[[6, 7], [19, 5], [31, 11], [10, 20], [24, 22], [5, 31], [17, 32], [30, 29]].map(([x, y], k) => (
              <circle key={k} cx={x} cy={y} r={3.8} fill={stained ? 'url(#rbc)' : '#fee2e2'} />
            ))}
          </pattern>
        </defs>
        <circle r={radius} fill={stained ? '#fff7ed' : '#fffbeb'} />
        <circle r={radius} fill="url(#blood)" />
        {stained && <g><circle cx={60} cy={-40} r={6} fill="#ede9fe" /><circle cx={60} cy={-40} r={4} fill="#6d28d9" /><circle cx={-150} cy={90} r={6} fill="#ede9fe" /><circle cx={-150} cy={90} r={4.5} fill="#6d28d9" /></g>}
      </g>
    )
  }
  return (
    <g>
      <circle r={radius} fill="#f8fafc" />
      {id === 'cheek' && scattered.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a}) scale(${p.s})`}>
          <path d="M-30 -8 Q-24 -30 2 -28 Q28 -26 30 -2 Q32 24 6 28 Q-20 30 -28 14 Z" fill={stained ? '#dbeafe' : '#f1f5f9'} stroke={stained ? '#3b82f6' : '#e2e8f0'} strokeWidth={1} />
          <circle cx={2} cy={0} r={5} fill={stained ? '#1d4ed8' : '#e2e8f0'} opacity={stained ? 0.9 : 0.4} />
        </g>
      ))}
      {id === 'bacteria' && scattered.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={3 * p.s} height={0.8} rx={0.4} transform={`rotate(${p.a} ${p.x} ${p.y})`} fill={stained ? '#7e22ce' : '#e2e8f0'} />
      ))}
      {id === 'neuron' && scattered.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`} stroke={stained ? '#44403c' : '#d6d3d1'} fill="none" strokeWidth={2.5}>
          {[0, 60, 130, 200, 260].map((d) => <path key={d} d={`M0 0 L${40 * Math.cos((d * Math.PI) / 180)} ${40 * Math.sin((d * Math.PI) / 180)} l${12 * Math.cos(((d + 30) * Math.PI) / 180)} ${12 * Math.sin(((d + 30) * Math.PI) / 180)}`} />)}
          <path d="M0 0 C 80 20, 160 -20, 320 10" strokeWidth={3} />
          <circle r={14} fill={stained ? '#a8a29e' : '#f5f5f4'} />
          <circle r={5} fill={stained ? '#292524' : '#e7e5e4'} stroke="none" />
        </g>
      ))}
    </g>
  )
}
