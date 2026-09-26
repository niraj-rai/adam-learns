import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { work, type ForceDirection } from '../_shared/energy'

type Scenario = { id: string; emoji: string; name: string; story: string; force: number; dist: number; dir: ForceDirection; note: string }

const SCENARIOS: Scenario[] = [
  { id: 'lift', emoji: '🎒', name: 'Lift a bag', story: 'Lift a 5 kg school bag (weight 49 N) steadily onto a 1.5 m shelf.', force: 49, dist: 1.5, dir: 'along', note: 'You push up and the bag moves up: work is done on the bag, and it gains potential energy.' },
  { id: 'push', emoji: '📦', name: 'Push a box', story: 'Push a heavy box 4 m across the floor with a steady 60 N.', force: 60, dist: 4, dir: 'along', note: 'The force and the motion are in the same direction, so W = F × s.' },
  { id: 'hold', emoji: '🏋️', name: 'Hold still', story: 'Hold a 20 kg dumbbell (196 N) above your head for a minute.', force: 196, dist: 0, dir: 'along', note: 'Your arms get tired, but the dumbbell doesn’t move: in physics, no work is done on it.' },
  { id: 'carry', emoji: '🧳', name: 'Carry along', story: 'Carry a 10 kg suitcase (98 N) 20 m along a flat platform.', force: 98, dist: 20, dir: 'perpendicular', note: 'Your upward holding force is at right angles to the sideways motion, so it does no work on the suitcase.' },
  { id: 'friction', emoji: '🛷', name: 'Friction', story: 'Friction of 30 N acts on a sliding box as it moves 3 m.', force: 30, dist: 3, dir: 'against', note: 'Friction acts against the motion, so it does negative work: it takes energy away (as heat).' },
]

const DIRS: { d: ForceDirection; label: string }[] = [
  { d: 'along', label: '➡️ Along the motion' },
  { d: 'perpendicular', label: '⬆️ At right angles' },
  { d: 'against', label: '⬅️ Against the motion' },
]

export default function WorkMeter() {
  const [sid, setSid] = useState('lift')
  const sc = SCENARIOS.find((s) => s.id === sid)!
  const [force, setForce] = useState(sc.force)
  const [dist, setDist] = useState(sc.dist)
  const [dir, setDir] = useState<ForceDirection>(sc.dir)
  const pick = (s: Scenario) => { setSid(s.id); setForce(s.force); setDist(s.dist); setDir(s.dir) }
  const W = work(force, dist, dir)
  const moveLen = Math.min(260, dist * 13)
  const fLen = Math.min(120, 20 + force / 2)
  return (
    <LabFrame labId="work-meter" title="Work Meter" subtitle="Work is done only when a force moves something in the direction of the force." howTo={<p>Pick a situation, then change the force, the distance moved and the direction of the force. Watch when the work is positive, zero or negative.</p>}>
      <div className="flex flex-wrap gap-1">
        {SCENARIOS.map((s) => <button key={s.id} type="button" aria-pressed={sid === s.id} onClick={() => pick(s)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', sid === s.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>)}
      </div>
      <p className="mt-3 rounded-2xl bg-muted/50 p-4 text-[15px]">{sc.story}</p>
      <svg viewBox="0 0 560 160" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`Force ${force} N, displacement ${dist} m, work ${W.toFixed(0)} J`}>
        <defs>
          <marker id="wm-f" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" /></marker>
          <marker id="wm-s" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" /></marker>
        </defs>
        <rect x={0} y={130} width={560} height={30} fill="currentColor" opacity={0.08} />
        {dist > 0 && <rect x={60} y={90} width={40} height={40} rx={4} fill="currentColor" opacity={0.12} strokeDasharray="4 3" stroke="currentColor" />}
        <rect x={60 + moveLen} y={90} width={40} height={40} rx={4} fill="#d97706" />
        <text x={80 + moveLen} y={116} textAnchor="middle" fontSize={18}>{sc.emoji}</text>
        {dist > 0 && <line x1={80} y1={145} x2={80 + moveLen} y2={145} stroke="#2563eb" strokeWidth={3} markerEnd="url(#wm-s)" />}
        <text x={80 + moveLen / 2} y={158} textAnchor="middle" fontSize={11} fill="#2563eb">{dist > 0 ? `displacement ${dist} m` : 'no displacement'}</text>
        {dir === 'along' && <line x1={100 + moveLen} y1={110} x2={100 + moveLen + fLen} y2={110} stroke="#dc2626" strokeWidth={4} markerEnd="url(#wm-f)" />}
        {dir === 'against' && <line x1={60 + moveLen} y1={110} x2={60 + moveLen - fLen} y2={110} stroke="#dc2626" strokeWidth={4} markerEnd="url(#wm-f)" />}
        {dir === 'perpendicular' && <line x1={80 + moveLen} y1={90} x2={80 + moveLen} y2={Math.max(8, 90 - fLen / 1.5)} stroke="#dc2626" strokeWidth={4} markerEnd="url(#wm-f)" />}
        <text x={300} y={24} textAnchor="middle" fontSize={12} fill="#dc2626" fontWeight={600}>force {force} N</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Force F = <b>{force} N</b><Slider value={[force]} min={0} max={200} step={1} onValueChange={([v]) => setForce(v)} className="mt-1" aria-label="force" /></label>
        <label className="text-sm">Distance moved s = <b>{dist} m</b><Slider value={[dist]} min={0} max={20} step={0.5} onValueChange={([v]) => setDist(v)} className="mt-1" aria-label="distance" /></label>
      </div>
      <div className="mt-3 flex flex-wrap gap-1" role="radiogroup" aria-label="Direction of the force">
        {DIRS.map((x) => <button key={x.d} type="button" role="radio" aria-checked={dir === x.d} onClick={() => setDir(x.d)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', dir === x.d ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.label}</button>)}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Readout label="Work done W = F × s" value={dir === 'perpendicular' ? '0 J (force ⟂ motion)' : `${dir === 'against' ? '−' : ''}${force} × ${dist} = ${W.toFixed(1).replace('-', '−').replace('.0', '')} J`} />
        <Readout label="Energy transferred" value={W > 0 ? `${W.toFixed(0)} J given to the object` : W < 0 ? `${(-W).toFixed(0)} J taken away (heat)` : 'None'} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">{sid === sc.id && force === sc.force && dist === sc.dist && dir === sc.dir ? sc.note : 'Work = force × displacement in the direction of the force. 1 joule (J) is the work done when a force of 1 N moves something 1 m.'}</p>
    </LabFrame>
  )
}
