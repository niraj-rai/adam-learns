import { useState } from 'react'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { SliderRow } from '../_shared/SliderRow'

const ANIMALS = [{ name: 'Frog', emoji: '🐸', color: '#16a34a' }, { name: 'Kangaroo', emoji: '🦘', color: '#ea580c' }]

export default function AnimalJumps() {
  const [a, setA] = useState(3)
  const [b, setB] = useState(4)
  const max = 40
  const hitsA = Array.from({ length: Math.floor(max / a) }, (_, i) => (i + 1) * a)
  const hitsB = Array.from({ length: Math.floor(max / b) }, (_, i) => (i + 1) * b)
  const common = hitsA.filter((n) => hitsB.includes(n))
  const W = 320
  const X = (n: number) => 10 + (n / max) * (W - 20)
  return (
    <LabFrame labId="animal-jumps" title="Animal Jumps" subtitle="Animals that jump the same distance each time land on multiples. Where do two animals land on the same spot?" howTo={<p>Choose how far the frog and kangaroo jump. Their landing spots are the multiples; the stars show where both land.</p>}>
      <svg viewBox={`0 0 ${W} 110`} className="w-full rounded-2xl border bg-background" role="img" aria-label={`Both land on ${common.join(', ') || 'no common spot up to 40'}`}>
        <line x1={10} y1={60} x2={W - 10} y2={60} stroke="currentColor" opacity={0.5} />
        {Array.from({ length: max / 5 + 1 }, (_, i) => i * 5).map((n) => <text key={n} x={X(n)} y={78} textAnchor="middle" fontSize={8} fill="currentColor">{n}</text>)}
        {hitsA.map((n) => <path key={`a${n}`} d={`M${X(n - a)},60 Q${X(n - a / 2)},${30} ${X(n)},60`} fill="none" stroke={ANIMALS[0].color} strokeWidth={1.5} />)}
        {hitsB.map((n) => <path key={`b${n}`} d={`M${X(n - b)},60 Q${X(n - b / 2)},${95} ${X(n)},60`} fill="none" stroke={ANIMALS[1].color} strokeWidth={1.5} />)}
        {common.map((n) => <text key={`c${n}`} x={X(n)} y={24} textAnchor="middle" fontSize={12}>⭐</text>)}
        <text x={12} y={14} fontSize={10} fill={ANIMALS[0].color}>🐸 above</text>
        <text x={12} y={106} fontSize={10} fill={ANIMALS[1].color}>🦘 below</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SliderRow label="🐸 Frog jumps" value={a} min={2} max={9} onChange={setA} />
        <SliderRow label="🦘 Kangaroo jumps" value={b} min={2} max={9} onChange={setB} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Frog lands on (multiples)" value={hitsA.slice(0, 8).join(', ') + '…'} />
        <Readout label="Kangaroo lands on" value={hitsB.slice(0, 8).join(', ') + '…'} />
        <Readout label="Both land on ⭐" value={common.length ? common.join(', ') : 'none up to 40'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">The numbers you land on are <b>multiples</b> of the jump size. Spots where both animals land are <b>common multiples</b>; the first one is the smallest common multiple. Try jumps of 2 and 4, or 3 and 5. What do you notice?</p>
    </LabFrame>
  )
}
