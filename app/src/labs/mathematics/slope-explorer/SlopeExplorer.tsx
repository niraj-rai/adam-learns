import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { CoordGrid, lineEnds } from '../_shared/CoordGrid'
import { fmt, slope, type Pt } from '../_shared/coord'

const STORIES = [
  { name: 'Auto fare', emoji: '🛺', m: 2, c: 3, text: 'An auto charges ₹30 to start plus ₹20 per km (scaled: 1 square = ₹10). y = 2x + 3.' },
  { name: 'Water tank', emoji: '🚰', m: -1.5, c: 7, text: 'A tank holds 700 L and drains at 150 L per hour (1 square = 100 L). y = −1.5x + 7.' },
  { name: 'Savings', emoji: '🐷', m: 0.5, c: 1, text: 'You have ₹100 and save ₹50 a week (1 square = ₹100). y = 0.5x + 1.' },
]

export default function SlopeExplorer() {
  const [mode, setMode] = useState<'sliders' | 'points'>('sliders')
  const [m, setM] = useState(1)
  const [c, setC] = useState(2)
  const [A, setA] = useState<Pt>({ x: -2, y: -1 })
  const [B, setB] = useState<Pt>({ x: 3, y: 4 })
  const [story, setStory] = useState<number | null>(null)
  const pm = mode === 'points' ? slope(A, B) : m
  const pc = mode === 'points' && Number.isFinite(pm) ? A.y - pm * A.x : c
  const vertical = !Number.isFinite(pm)
  const [p, q] = lineEnds(pm, pc, -8, 8)
  const zero = pm !== 0 && !vertical ? -pc / pm : null
  const eq = vertical ? `x = ${A.x}` : `y = ${pm === 0 ? '' : `${fmt(pm)}x`}${pc === 0 && pm !== 0 ? '' : `${pc >= 0 && pm !== 0 ? ' + ' : pm !== 0 ? ' − ' : ''}${fmt(Math.abs(pc))}`}`
  return (
    <LabFrame labId="slope-explorer" title="Slope Explorer" subtitle="Every straight line is y = mx + c: m is the slope (steepness) and c is where it crosses the y-axis." howTo={<p>Change m and c with the sliders, or drag two points and let the lab find the equation. Try a story to see lines in real life.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['sliders', 'Set m and c'], ['points', 'Drag two points']] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={cn('rounded-md px-3 py-1', mode === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{l}</button>)}
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_1fr]">
        <CoordGrid label={`Line ${eq}`} points={mode === 'points' ? [{ p: A, color: '#2563eb', label: 'A', onMove: setA }, { p: B, color: '#dc2626', label: 'B', onMove: setB }] : []}>
          {(X, Y) => (
            <>
              {vertical ? <line x1={X(A.x)} y1={Y(-8)} x2={X(A.x)} y2={Y(8)} stroke="#6366f1" strokeWidth={3} /> : <line x1={X(p.x)} y1={Y(p.y)} x2={X(q.x)} y2={Y(q.y)} stroke="#6366f1" strokeWidth={3} />}
              {!vertical && pc >= -8 && pc <= 8 && <circle cx={X(0)} cy={Y(pc)} r={5} fill="#10b981" />}
              {!vertical && Number.isFinite(pm) && pc + pm <= 8 && pc + pm >= -8 && <path d={`M${X(0)},${Y(pc)} L${X(1)},${Y(pc)} L${X(1)},${Y(pc + pm)}`} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />}
            </>
          )}
        </CoordGrid>
        <div className="space-y-3">
          {mode === 'sliders' && (
            <>
              <label className="block text-sm">Slope m = <b>{fmt(m)}</b><Slider value={[m]} min={-4} max={4} step={0.5} onValueChange={([v]) => { setM(v); setStory(null) }} className="mt-1" aria-label="slope" /></label>
              <label className="block text-sm">y-intercept c = <b>{fmt(c)}</b><Slider value={[c]} min={-6} max={6} step={1} onValueChange={([v]) => { setC(v); setStory(null) }} className="mt-1" aria-label="y-intercept" /></label>
              <div className="flex flex-wrap gap-1">{STORIES.map((s, i) => <button key={s.name} type="button" aria-pressed={story === i} onClick={() => { setM(s.m); setC(s.c); setStory(i) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', story === i ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>)}</div>
              {story !== null && <p className="rounded-xl bg-muted/60 px-3 py-2 text-sm">{STORIES[story].text}</p>}
            </>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Readout label="Equation" value={eq} />
            <Readout label="Slope (rise ÷ run)" value={vertical ? 'undefined (vertical)' : fmt(pm)} />
            <Readout label="y-intercept" value={vertical ? '—' : fmt(pc)} />
            <Readout label="Zero of mx + c (crosses x-axis)" value={vertical ? `x = ${A.x}` : zero === null ? (pc === 0 ? 'every x' : 'never') : `x = ${fmt(zero)}`} />
          </div>
          <p className="text-sm text-muted-foreground">{pm > 0 ? '📈 Positive slope: the line rises from left to right.' : pm < 0 ? '📉 Negative slope: the line falls from left to right.' : vertical ? 'A vertical line has no slope: x stays the same.' : '➡️ Zero slope: a horizontal line, y stays the same.'}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A <b>linear polynomial</b> is p(x) = mx + c. Its graph is a straight line. The <b>slope</b> m tells you how much y changes when x goes up by 1 (the orange step). The <b>zero</b> of the polynomial, where p(x) = 0, is the x-intercept: x = −c/m.</p>
    </LabFrame>
  )
}
