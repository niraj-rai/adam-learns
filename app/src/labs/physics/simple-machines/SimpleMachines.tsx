import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { leverEffort, pulleyEffort, rampEffort } from '../_shared/energy'

type Tab = 'lever' | 'pulley' | 'ramp'
const TABS: { t: Tab; label: string }[] = [
  { t: 'lever', label: '⚖️ Lever' },
  { t: 'pulley', label: '🏗️ Pulley' },
  { t: 'ramp', label: '📐 Ramp' },
]
const f0 = (x: number) => (Math.round(x * 10) / 10).toString()

export default function SimpleMachines() {
  const [tab, setTab] = useState<Tab>('lever')
  const [load, setLoad] = useState(600)
  const [eff, setEff] = useState(100)
  // lever
  const [loadArm, setLoadArm] = useState(0.5)
  const [effortArm, setEffortArm] = useState(1.5)
  // pulley
  const [strands, setStrands] = useState(2)
  // ramp
  const [len, setLen] = useState(4)
  const RAMP_H = 1
  const e = eff / 100

  let effort = 0
  let effortDist = 0
  let loadDist = 0
  if (tab === 'lever') { effort = leverEffort(load, loadArm, effortArm) / e; loadDist = loadArm * 0.2; effortDist = effortArm * 0.2 }
  if (tab === 'pulley') { effort = pulleyEffort(load, strands, e); loadDist = 1; effortDist = strands }
  if (tab === 'ramp') { effort = rampEffort(load, RAMP_H, len, e); loadDist = RAMP_H; effortDist = len }
  const MA = load / effort
  const VR = effortDist / loadDist
  const workIn = effort * effortDist
  const workOut = load * loadDist

  return (
    <LabFrame labId="simple-machines" title="Simple Machines" subtitle="Machines let a small effort move a big load, but you always pay for it with distance." howTo={<p>Choose a machine, set the load and the machine's shape, and see the effort needed. Then lower the efficiency to add friction.</p>}>
      <div className="inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {TABS.map((x) => <button key={x.t} type="button" role="tab" aria-selected={tab === x.t} onClick={() => setTab(x.t)} className={cn('rounded-md px-3 py-1', tab === x.t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{x.label}</button>)}
      </div>
      <svg viewBox="0 0 560 190" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`${tab}: load ${load} N, effort ${f0(effort)} N`}>
        {tab === 'lever' && (() => {
          const fx = 280
          const scale = 120
          const lx = fx - loadArm * scale
          const ex = fx + effortArm * scale
          return (
            <g>
              <path d={`M${fx - 18},170 L${fx},140 L${fx + 18},170 Z`} fill="#64748b" />
              <rect x={Math.min(lx, fx) - 10} y={134} width={ex - lx + 20} height={6} fill="#a16207" />
              <rect x={lx - 22} y={96} width={44} height={38} rx={4} fill="#d97706" /><text x={lx} y={120} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{load} N</text>
              <line x1={ex} y1={60} x2={ex} y2={128} stroke="#16a34a" strokeWidth={4} /><path d={`M${ex},134 l-7,-10 h14 z`} fill="#16a34a" />
              <text x={ex} y={52} textAnchor="middle" fontSize={11} fill="#16a34a" fontWeight={600}>effort {f0(effort)} N</text>
              <text x={(lx + fx) / 2} y={160} textAnchor="middle" fontSize={10} fill="currentColor">{loadArm} m</text>
              <text x={(ex + fx) / 2} y={160} textAnchor="middle" fontSize={10} fill="currentColor">{effortArm} m</text>
            </g>
          )
        })()}
        {tab === 'pulley' && (
          <g>
            <rect x={200} y={8} width={160} height={8} fill="#64748b" />
            {Array.from({ length: strands }, (_, i) => <line key={i} x1={250 + i * 18} y1={16} x2={250 + i * 18} y2={120} stroke="#475569" strokeWidth={2} />)}
            <circle cx={259 + ((strands - 1) * 18) / 2 - 9} cy={30} r={14} fill="none" stroke="#475569" strokeWidth={3} />
            {strands > 1 && <circle cx={259 + ((strands - 1) * 18) / 2 - 9} cy={120} r={14} fill="none" stroke="#475569" strokeWidth={3} />}
            <rect x={230 + ((strands - 1) * 18) / 2 - 10} y={136} width={60} height={40} rx={4} fill="#d97706" /><text x={260 + ((strands - 1) * 18) / 2 - 10} y={161} textAnchor="middle" fontSize={11} fill="white" fontWeight={700}>{load} N</text>
            <path d={`M${259 + ((strands - 1) * 18) / 2 - 9},16 Q380,16 380,40`} fill="none" stroke="#475569" strokeWidth={2} />
            <line x1={380} y1={40} x2={380} y2={150} stroke="#16a34a" strokeWidth={3} /><path d="M380,160 l-7,-10 h14 z" fill="#16a34a" />
            <text x={390} y={100} fontSize={11} fill="#16a34a" fontWeight={600}>effort {f0(effort)} N</text>
            <text x={60} y={100} fontSize={11} fill="currentColor">{strands} supporting {strands === 1 ? 'rope' : 'ropes'}</text>
          </g>
        )}
        {tab === 'ramp' && (() => {
          const w = Math.sqrt(len * len - RAMP_H * RAMP_H) * 90
          const x0 = 60
          const y0 = 170
          const top = y0 - RAMP_H * 90
          const ang = Math.atan2(RAMP_H * 90, w)
          const bx = x0 + w * 0.55
          const by = y0 - (w * 0.55) * Math.tan(ang)
          return (
            <g>
              <path d={`M${x0},${y0} L${x0 + w},${y0} L${x0 + w},${top} Z`} fill="#94a3b8" opacity={0.6} />
              <g transform={`translate(${bx},${by}) rotate(${(-ang * 180) / Math.PI})`}><rect x={-22} y={-30} width={44} height={30} rx={4} fill="#d97706" /><text x={0} y={-11} textAnchor="middle" fontSize={10} fill="white" fontWeight={700}>{load} N</text></g>
              <text x={x0 + w + 6} y={(y0 + top) / 2} fontSize={10} fill="currentColor">{RAMP_H} m high</text>
              <text x={x0 + w / 2} y={y0 + 14} textAnchor="middle" fontSize={10} fill="currentColor">slope {len} m long</text>
              <text x={x0 + 10} y={30} fontSize={11} fill="#16a34a" fontWeight={600}>effort up the slope {f0(effort)} N</text>
            </g>
          )
        })()}
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Load <b>{load} N</b><Slider value={[load]} min={100} max={1000} step={50} onValueChange={([v]) => setLoad(v)} className="mt-1" aria-label="load" /></label>
        {tab === 'lever' && <>
          <label className="text-sm">Load arm <b>{loadArm} m</b><Slider value={[loadArm]} min={0.25} max={1} step={0.25} onValueChange={([v]) => setLoadArm(v)} className="mt-1" aria-label="load arm" /></label>
          <label className="text-sm">Effort arm <b>{effortArm} m</b><Slider value={[effortArm]} min={0.25} max={2} step={0.25} onValueChange={([v]) => setEffortArm(v)} className="mt-1" aria-label="effort arm" /></label>
        </>}
        {tab === 'pulley' && <label className="text-sm">Supporting ropes <b>{strands}</b><Slider value={[strands]} min={1} max={4} step={1} onValueChange={([v]) => setStrands(v)} className="mt-1" aria-label="supporting ropes" /></label>}
        {tab === 'ramp' && <label className="text-sm">Ramp length <b>{len} m</b> (height 1 m)<Slider value={[len]} min={1.5} max={6} step={0.5} onValueChange={([v]) => setLen(v)} className="mt-1" aria-label="ramp length" /></label>}
        <label className="text-sm">Efficiency <b>{eff}%</b><Slider value={[eff]} min={50} max={100} step={5} onValueChange={([v]) => setEff(v)} className="mt-1" aria-label="efficiency" /></label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Readout label="Effort needed" value={`${f0(effort)} N`} />
        <Readout label="Mechanical advantage = load ÷ effort" value={f0(MA)} />
        <Readout label="Effort moves ÷ load moves" value={`${f0(VR)} × further`} />
        <Readout label="Work in → useful work out" value={`${f0(workIn)} → ${f0(workOut)} J`} />
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">A machine with a mechanical advantage of {f0(MA)} lets you lift {load} N with only {f0(effort)} N, but you must move the effort {f0(VR)} times as far. {eff === 100 ? 'With no friction, work in = work out: machines never save energy.' : `With friction, work in is bigger than useful work out: efficiency = ${f0(workOut)} ÷ ${f0(workIn)} = ${eff}%.`}</p>
    </LabFrame>
  )
}
