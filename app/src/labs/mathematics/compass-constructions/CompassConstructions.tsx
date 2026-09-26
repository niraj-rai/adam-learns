import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Construction = { name: string; emoji: string; steps: string[]; draw: (k: number) => ReactNode; why: string }

const arc = (cx: number, cy: number, r: number, a0: number, a1: number, color = '#6366f1') => {
  const p = (a: number) => `${cx + r * Math.cos((a * Math.PI) / 180)},${cy - r * Math.sin((a * Math.PI) / 180)}`
  return <path d={`M${p(a0)} A${r},${r} 0 0,0 ${p(a1)}`} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="5 3" />
}
const dot = (x: number, y: number, l: string, c = '#1e293b') => <g><circle cx={x} cy={y} r={4} fill={c} /><text x={x + 6} y={y - 6} fontSize={12} fontWeight={700} fill={c}>{l}</text></g>

const CONSTRUCTIONS: Construction[] = [
  {
    name: 'Perpendicular bisector', emoji: '📏',
    steps: ['Draw the line segment AB.', 'With centre A and a radius more than half of AB, draw arcs above and below AB.', 'With centre B and the SAME radius, draw arcs crossing the first two at P and Q.', 'Join P and Q. PQ is the perpendicular bisector of AB, meeting it at its midpoint M.'],
    draw: (k) => <>
      <line x1={80} y1={130} x2={240} y2={130} stroke="#1e293b" strokeWidth={2.5} />{dot(80, 130, 'A')}{dot(240, 130, 'B')}
      {k >= 1 && <>{arc(80, 130, 110, 10, 70)}{arc(80, 130, 110, -70, -10)}</>}
      {k >= 2 && <>{arc(240, 130, 110, 110, 170)}{arc(240, 130, 110, 190, 250)}{dot(160, 55, 'P', '#dc2626')}{dot(160, 205, 'Q', '#dc2626')}</>}
      {k >= 3 && <><line x1={160} y1={30} x2={160} y2={230} stroke="#dc2626" strokeWidth={2.5} />{dot(160, 130, 'M', '#10b981')}<rect x={160} y={118} width={12} height={12} fill="none" stroke="#10b981" /></>}
    </>,
    why: 'P and Q are each the same distance from A as from B, and every point equidistant from A and B lies on the perpendicular bisector.',
  },
  {
    name: 'Angle bisector', emoji: '📐',
    steps: ['Draw an angle XOY.', 'With centre O, draw an arc cutting OX at A and OY at B.', 'With centres A and B and equal radii, draw arcs that cross at C.', 'Join OC. It bisects the angle: ∠XOC = ∠COY.'],
    draw: (k) => <>
      <line x1={60} y1={210} x2={290} y2={210} stroke="#1e293b" strokeWidth={2.5} /><line x1={60} y1={210} x2={230} y2={40} stroke="#1e293b" strokeWidth={2.5} />{dot(60, 210, 'O')}<text x={284} y={228} fontSize={12}>X</text><text x={234} y={36} fontSize={12}>Y</text>
      {k >= 1 && <>{arc(60, 210, 120, 0, 45)}{dot(180, 210, 'A')}{dot(60 + 120 * 0.707, 210 - 120 * 0.707, 'B')}</>}
      {k >= 2 && <>{arc(180, 210, 95, 25, 80)}{arc(60 + 84.9, 210 - 84.9, 95, -25, 15)}{dot(60 + 194 * 0.924, 210 - 194 * 0.383, 'C', '#dc2626')}</>}
      {k >= 3 && <line x1={60} y1={210} x2={60 + 230 * 0.924} y2={210 - 230 * 0.383} stroke="#dc2626" strokeWidth={2.5} />}
    </>,
    why: 'Triangles OAC and OBC are congruent (SSS: OA = OB, AC = BC, OC common), so the two angles at O are equal.',
  },
  {
    name: "Euclid's equilateral triangle", emoji: '🔺',
    steps: ['Draw the line segment AB.', 'With centre A and radius AB, draw a circle.', 'With centre B and radius BA, draw a circle. The circles meet at C.', 'Join CA and CB. Triangle ABC is equilateral.'],
    draw: (k) => <>
      <line x1={110} y1={170} x2={210} y2={170} stroke="#1e293b" strokeWidth={2.5} />{dot(110, 170, 'A')}{dot(210, 170, 'B')}
      {k >= 1 && <circle cx={110} cy={170} r={100} fill="none" stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.8} />}
      {k >= 2 && <><circle cx={210} cy={170} r={100} fill="none" stroke="#6366f1" strokeDasharray="5 3" strokeWidth={1.8} />{dot(160, 170 - 86.6, 'C', '#dc2626')}</>}
      {k >= 3 && <polygon points={`110,170 210,170 160,${170 - 86.6}`} fill="#dc2626" fillOpacity={0.12} stroke="#dc2626" strokeWidth={2.5} />}
    </>,
    why: 'This is Proposition 1 of Euclid’s Elements. AC = AB (radii of the first circle) and BC = BA (radii of the second), so all three sides are equal.',
  },
  {
    name: 'Śulba rope right angle', emoji: '🪢',
    steps: ['Take a rope and tie knots to mark 12 equal parts.', 'Fix pegs at the knots 0 and 3 to make one side of length 3.', 'Stretch the rope so the next side has 4 parts and the last has 5, back to the start.', 'The corner between the sides of 3 and 4 is a perfect right angle.'],
    draw: (k) => <>
      {k === 0 && Array.from({ length: 13 }, (_, i) => <circle key={i} cx={40 + i * 20} cy={130} r={4} fill="#a16207" />)}
      {k === 0 && <line x1={40} y1={130} x2={280} y2={130} stroke="#a16207" strokeWidth={2} />}
      {k >= 1 && <><line x1={80} y1={200} x2={80 + 3 * 40} y2={200} stroke="#a16207" strokeWidth={3} />{dot(80, 200, 'peg', '#78350f')}{dot(200, 200, 'peg', '#78350f')}<text x={140} y={220} textAnchor="middle" fontSize={12}>3</text></>}
      {k >= 2 && <><line x1={200} y1={200} x2={200} y2={40} stroke="#a16207" strokeWidth={3} /><line x1={200} y1={40} x2={80} y2={200} stroke="#a16207" strokeWidth={3} /><text x={212} y={125} fontSize={12}>4</text><text x={128} y={115} fontSize={12}>5</text></>}
      {k >= 3 && <rect x={186} y={186} width={14} height={14} fill="none" stroke="#dc2626" strokeWidth={2} />}
    </>,
    why: 'The Baudhāyana Śulba Sūtra (around 800 BCE) used ropes like this to lay out fire altars. It works because 3² + 4² = 5²: the converse of the Baudhāyana–Pythagoras theorem.',
  },
]

export default function CompassConstructions() {
  const [ci, setCi] = useState(0)
  const [k, setK] = useState(0)
  const c = CONSTRUCTIONS[ci]
  return (
    <LabFrame labId="compass-constructions" title="Ruler and Compass" subtitle="Euclid built geometry using only a straight edge and a compass. Step through classic constructions." howTo={<p>Pick a construction and press Next step. Try each one on paper with a real compass!</p>}>
      <div className="flex flex-wrap gap-1">{CONSTRUCTIONS.map((x, i) => <button key={x.name} type="button" aria-pressed={ci === i} onClick={() => { setCi(i); setK(0) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', ci === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}</div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 320 250" className="w-full rounded-2xl border bg-background" role="img" aria-label={`${c.name}: step ${k + 1}`}>{c.draw(k)}</svg>
        <div className="space-y-2">
          <ol className="space-y-1.5 text-sm">{c.steps.map((s, i) => <li key={i} className={cn('rounded-lg px-3 py-1.5', i === k ? 'bg-chem-soft font-semibold' : i < k ? 'text-muted-foreground' : 'opacity-40')}>{i + 1}. {s}</li>)}</ol>
          <div className="flex gap-2"><Button variant="outline" disabled={k === 0} onClick={() => setK(k - 1)}>← Back</Button><Button disabled={k === c.steps.length - 1} onClick={() => setK(k + 1)}>Next step →</Button></div>
          {k === c.steps.length - 1 && <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">🧠 <b>Why it works:</b> {c.why}</p>}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Euclid's postulates include: a straight line can be drawn between any two points; a circle can be drawn with any centre and radius. Everything above uses only those two moves.</p>
    </LabFrame>
  )
}
