import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { canDivide, canRemoveC, canRemoveX, divide, isSolved, PUZZLES, removeC, removeX, show, solution, type Eq, type Side } from './model'

function Pan({ s, cx, y }: { s: Side; cx: number; y: number }) {
  const items = [...Array(s.x).fill('x'), ...Array(s.c).fill('1')]
  const per = 6
  return (
    <g>
      <path d={`M${cx - 80},${y} L${cx + 80},${y} L${cx + 65},${y + 12} L${cx - 65},${y + 12} Z`} fill="#94a3b8" />
      {items.map((it, i) => {
        const row = Math.floor(i / per)
        const col = i % per
        const x = cx - 75 + col * 25
        const yy = y - 24 - row * 24
        return it === 'x'
          ? <g key={i}><rect x={x} y={yy} width={22} height={22} rx={6} fill="#6366f1" /><text x={x + 11} y={yy + 16} textAnchor="middle" fontSize={13} fontWeight={700} fill="white">x</text></g>
          : <g key={i}><rect x={x + 3} y={yy + 6} width={16} height={16} rx={2} fill="#f59e0b" /><text x={x + 11} y={yy + 18} textAnchor="middle" fontSize={10} fontWeight={700} fill="#422006">1</text></g>
      })}
    </g>
  )
}

export default function BalanceScale() {
  const [pi, setPi] = useState(0)
  const [e, setE] = useState<Eq>(PUZZLES[0])
  const [moves, setMoves] = useState(0)
  const [tilt, setTilt] = useState(0)
  const solved = isSolved(e)
  const act = (next: Eq) => {
    setE(next)
    setMoves((m) => m + 1)
    setTilt(0)
    if (isSolved(next)) sfx.win()
    else sfx.click()
  }
  const load = (i: number) => { setPi(i); setE(PUZZLES[i]); setMoves(0); setTilt(0) }
  const oneSided = () => { setTilt(e.L.c > 0 ? 1 : -1); sfx.wrong() }
  const angle = tilt * 8
  return (
    <LabFrame labId="balance-scale" title="Balance Scale" subtitle="An equation is a balance. Whatever you do to one side, do to the other." howTo={<p>Each 🟦 x is a bag of unknown weight; each 🟧 is 1 kg. Remove the same thing from both pans, or split both pans into equal groups, until one pan holds a single x.</p>}>
      <div className="flex flex-wrap gap-1">
        {PUZZLES.map((p, i) => (
          <button key={i} type="button" aria-pressed={pi === i} onClick={() => load(i)} className={cn('rounded-lg border-2 px-2.5 py-1 font-mono text-sm', pi === i ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{show(p.L)} = {show(p.R)}</button>
        ))}
      </div>
      <svg viewBox="0 0 440 240" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Balance: ${show(e.L)} on the left, ${show(e.R)} on the right${tilt ? ', tipping!' : ', level'}`}>
        <polygon points="200,230 240,230 220,120" fill="#64748b" />
        <g transform={`rotate(${angle} 220 120)`} style={{ transition: 'transform 0.4s' }}>
          <rect x={60} y={116} width={320} height={8} rx={4} fill="#475569" />
          <line x1={110} y1={124} x2={110} y2={176} stroke="#475569" strokeWidth={2} />
          <line x1={330} y1={124} x2={330} y2={176} stroke="#475569" strokeWidth={2} />
          <Pan s={e.L} cx={110} y={176} />
          <Pan s={e.R} cx={330} y={176} />
        </g>
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => act(removeX(e))} disabled={!canRemoveX(e) || solved}>Remove x from both</Button>
        <Button onClick={() => act(removeC(e))} disabled={!canRemoveC(e) || solved}>Remove 1 kg from both</Button>
        {[2, 3, 4, 5, 6].filter((k) => canDivide(e, k)).map((k) => (
          <Button key={k} variant="outline" onClick={() => act(divide(e, k))} disabled={solved}>Split both into {k} groups</Button>
        ))}
        <Button variant="ghost" onClick={oneSided} disabled={solved}>Remove from one side only?</Button>
        <Button variant="ghost" onClick={() => load(pi)}>Reset</Button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Equation now" value={`${show(e.L)} = ${show(e.R)}`} />
        <Readout label="Moves" value={`${moves}`} />
        <Readout label="x =" value={solved ? `${solution(PUZZLES[pi])} kg` : '?'} />
      </div>
      <p role="status" className={cn('mt-3 rounded-xl px-4 py-2 text-sm', solved ? 'bg-success-soft' : tilt ? 'bg-warn-soft' : 'bg-chem-soft')}>
        {solved
          ? <>✅ Solved: <b>x = {solution(PUZZLES[pi])}</b>. Check: put {solution(PUZZLES[pi])} into the original equation. Both sides give {PUZZLES[pi].L.x * solution(PUZZLES[pi]) + PUZZLES[pi].L.c}.</>
          : tilt
            ? <>⚠️ Removing something from only one pan tips the balance: the two sides are no longer equal. Always do the <b>same thing to both sides</b>.</>
            : <>Tip: first get all the x's on one side (remove x from both), then remove the extra weights, then split into groups.</>}
      </p>
    </LabFrame>
  )
}
