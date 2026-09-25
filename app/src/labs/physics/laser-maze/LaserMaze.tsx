import { useState } from 'react'
import { Confetti } from '@/components/gamification/Confetti'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame } from '../../_kit/LabFrame'
import { key, LEVELS, type Placement, solved, targetsOf, trace } from './model'

const C = 44 // cell size

export default function LaserMaze() {
  const addXp = useProgress((s) => s.addXp)
  const awardBadge = useProgress((s) => s.awardBadge)
  const [li, setLi] = useState(0)
  const [placed, setPlaced] = useState<Placement>({})
  const [done, setDone] = useState<string[]>([])
  const [hint, setHint] = useState(false)
  const level = LEVELS[li]
  const g = level.grid
  const { points, hit } = trace(g, placed)
  const targets = targetsOf(g)
  const win = solved(g, placed)
  const used = Object.keys(placed).length

  const cycle = (x: number, y: number) => {
    if (g[y][x] !== '.' || win) return
    const k = key(x, y)
    const cur = placed[k]
    const next: Placement = { ...placed }
    if (!cur) {
      if (used >= level.mirrors) return sfx.wrong()
      next[k] = '/'
    } else if (cur === '/') next[k] = '\\'
    else delete next[k]
    setPlaced(next)
    if (solved(g, next)) {
      sfx.win()
      if (!done.includes(level.id)) {
        const d = [...done, level.id]
        setDone(d)
        addXp(10, `Laser Maze: ${level.title}`)
        if (d.length === LEVELS.length) {
          if (!useProgress.getState().badges.includes('light-bender')) addXp(25, 'Light Bender!')
          awardBadge('light-bender')
        }
      }
    } else sfx.click()
  }
  const go = (i: number) => { setLi(i); setPlaced({}); setHint(false) }

  return (
    <LabFrame labId="laser-maze" title="Boss Challenge: Laser Maze" subtitle="Place mirrors to bend the laser onto every target. Angle of incidence = angle of reflection!" howTo={<p>Tap an empty square to place a mirror. Tap again to flip it (/ then \), and a third time to remove it. You only have a few mirrors per level. Light every 🎯 target to clear the level. Clear all five to become a Light Bender.</p>}>
      {win && <Confetti count={done.length === LEVELS.length ? 90 : 35} />}
      <div className="mb-3 flex flex-wrap gap-2">
        {LEVELS.map((l, i) => (
          <button key={l.id} type="button" onClick={() => go(i)} className={cn('rounded-full border px-3 py-1.5 text-sm', i === li ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{done.includes(l.id) ? '✅' : `${i + 1}.`} {l.title}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-4">
        <svg viewBox={`0 0 ${g[0].length * C} ${g.length * C}`} className="w-full max-w-xl rounded-2xl border bg-slate-950" role="img" aria-label={`Laser maze level ${li + 1}: ${hit.size} of ${targets.length} targets lit`}>
          {g.map((row, y) => [...row].map((c, x) => {
            const p = placed[key(x, y)]
            const ch = p ?? c
            return (
              <g key={`${x}-${y}`} onClick={() => cycle(x, y)} className={cn(c === '.' && !win && 'cursor-pointer')}>
                <rect x={x * C} y={y * C} width={C} height={C} fill={c === '#' ? '#475569' : '#0f172a'} stroke="#1e293b" />
                {c === 'T' && <text x={x * C + C / 2} y={y * C + C / 2 + 7} textAnchor="middle" fontSize={20} opacity={hit.has(key(x, y)) ? 1 : 0.45}>🎯</text>}
                {'><^v'.includes(c) && <text x={x * C + C / 2} y={y * C + C / 2 + 7} textAnchor="middle" fontSize={20} transform={`rotate(${{ '>': 0, v: 90, '<': 180, '^': -90 }[c]} ${x * C + C / 2} ${y * C + C / 2})`}>🔦</text>}
                {(ch === '/' || ch === '\\') && (
                  <line x1={x * C + (ch === '/' ? 6 : 6)} y1={y * C + (ch === '/' ? C - 6 : 6)} x2={x * C + C - 6} y2={y * C + (ch === '/' ? 6 : C - 6)} stroke={p ? '#38bdf8' : '#94a3b8'} strokeWidth={5} strokeLinecap="round" />
                )}
              </g>
            )
          }))}
          <polyline points={points.map(([x, y]) => `${x * C + C / 2},${y * C + C / 2}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth={3} strokeLinejoin="round" pointerEvents="none" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
        </svg>
        <div className="min-w-48 space-y-2 text-sm">
          <p>🪞 Mirrors: <b>{level.mirrors - used}</b> of {level.mirrors} left</p>
          <p>🎯 Targets lit: <b>{[...hit].filter((h) => targets.includes(h)).length}</b> / {targets.length}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setPlaced({})}>↺ Clear mirrors</Button>
            <Button size="sm" variant="ghost" onClick={() => setHint(true)}>💡 Hint</Button>
          </div>
          {hint && <p className="rounded-lg bg-warn-soft px-3 py-2">{level.hint}</p>}
          {win && <p role="status" className="rounded-lg bg-success-soft px-3 py-2">✅ Level cleared!{li < LEVELS.length - 1 ? ' ' : ''}{li < LEVELS.length - 1 && <Button size="sm" className="ml-1 mt-1" onClick={() => go(li + 1)}>Next level →</Button>}{done.length === LEVELS.length && ' 🏆 You are a Light Bender!'}</p>}
          <p className="text-xs text-muted-foreground">Each mirror is at 45°, so it turns the beam through a right angle, just like the mirrors in a periscope.</p>
        </div>
      </div>
    </LabFrame>
  )
}
