import { motion } from 'motion/react'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { BONES_ADULT, BONES_BABY, elbowAngle, JOINTS, triceps } from './model'

export default function JointExplorer() {
  const [tab, setTab] = useState<'arm' | 'joints'>('arm')
  return (
    <LabFrame labId="joint-explorer" title="Joints and Muscles" subtitle="Bones give shape and support; joints let them move; muscles pull them in pairs." howTo={<p>Tab 1: contract the biceps and watch the arm bend, then find out what the triceps does. Tab 2: explore five kinds of joints and where they are found.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['arm', '💪 Muscles in pairs'], ['joints', '🦴 Types of joints']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'arm' ? <Arm /> : <Joints />}
    </LabFrame>
  )
}

function Arm() {
  const [b, setB] = useState(0.3)
  const angle = elbowAngle(b)
  const t = triceps(b)
  const ex = 150
  const ey = 120
  // forearm direction = upper-arm direction (shoulder → elbow) turned upwards by (180° − elbow angle)
  const upper = Math.atan2(ey - 60, ex - 40)
  const dir = upper - ((180 - angle) * Math.PI) / 180
  const hx = ex + 90 * Math.cos(dir)
  const hy = ey + 90 * Math.sin(dir)
  // muscles: the biceps runs along the top of the upper arm to the forearm; the triceps along the back to behind the elbow
  const ux = Math.cos(upper)
  const uy = Math.sin(upper)
  const nx = uy // unit normal pointing to the top side of the arm
  const ny = -ux
  const mx = (40 + ex) / 2
  const my = (60 + ey) / 2
  const fx = ex + 22 * Math.cos(dir)
  const fy = ey + 22 * Math.sin(dir)
  const biceps = `M${40 + nx * 8} ${60 + ny * 8} Q ${mx + nx * (14 + b * 16)} ${my + ny * (14 + b * 16)} ${fx + nx * 4} ${fy + ny * 4}`
  const tricepsPath = `M${40 - nx * 8} ${60 - ny * 8} Q ${mx - nx * (12 + t * 10)} ${my - ny * (12 + t * 10)} ${ex + ux * 10 - nx * 6} ${ey + uy * 10 - ny * 6}`
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 260 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Arm bent at ${angle} degrees`}>
        <line x1={40} y1={60} x2={ex} y2={ey} stroke="#e7e5e4" strokeWidth={14} strokeLinecap="round" />
        <line x1={40} y1={60} x2={ex} y2={ey} stroke="#a8a29e" strokeWidth={6} strokeLinecap="round" />
        <motion.line x1={ex} y1={ey} animate={{ x2: hx, y2: hy }} stroke="#a8a29e" strokeWidth={6} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={7} fill="#f59e0b" />
        <path d={biceps} stroke="#ef4444" strokeWidth={6 + b * 10} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d={tricepsPath} stroke="#3b82f6" strokeWidth={6 + t * 10} fill="none" strokeLinecap="round" opacity={0.85} />
        <text x={mx + nx * 34} y={my + ny * 34} fontSize={10} fill="#ef4444">biceps</text>
        <text x={mx - nx * 34 - 10} y={my - ny * 34 + 4} fontSize={10} fill="#3b82f6">triceps</text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Contract the biceps:
          <Slider value={[b]} min={0} max={1} step={0.05} onValueChange={([v]) => setB(v)} className="mt-1.5" aria-label="Biceps contraction" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Readout label="Elbow angle" value={`${angle}°`} />
          <Readout label="Biceps / triceps" value={`${Math.round(b * 100)}% / ${Math.round(t * 100)}%`} />
        </div>
        <p className="rounded-lg bg-chem-soft p-3 text-sm">Muscles can only <b>pull</b> (contract), never push. So they work in <b>pairs</b>: the biceps contracts to bend the arm while the triceps relaxes; the triceps contracts to straighten it while the biceps relaxes. Muscles are attached to bones by tough <b>tendons</b>.</p>
      </div>
    </div>
  )
}

function Joints() {
  const [jid, setJid] = useState('ball')
  const j = JOINTS.find((x) => x.id === jid)!
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="grid place-items-center rounded-2xl border bg-background p-6">
        <motion.div key={jid} className="text-7xl" animate={j.range === 0 ? {} : j.id === 'ball' ? { rotate: [0, 120, 240, 360] } : j.id === 'pivot' ? { rotate: [0, -70, 70, 0] } : j.id === 'hinge' ? { rotate: [0, 70, 0] } : { x: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>{j.emoji}</motion.div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">{JOINTS.map((x) => <button key={x.id} type="button" onClick={() => setJid(x.id)} className={cn('rounded-full border px-3 py-1 text-sm', x.id === jid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>)}</div>
        <Readout label="Found in" value={j.where} />
        <Readout label="Movement" value={j.moves} />
        <p className="text-xs text-muted-foreground">An adult skeleton has {BONES_ADULT} bones. A newborn baby has about {BONES_BABY}; some fuse together as they grow. Cartilage cushions joints, and ligaments hold bones together.</p>
      </div>
    </div>
  )
}
