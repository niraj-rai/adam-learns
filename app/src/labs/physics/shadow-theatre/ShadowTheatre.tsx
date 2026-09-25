import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { MATERIALS, pinholeImage, shadowHeight } from './model'

const SCREEN_X = 360
const LIGHT_X = 20
const AXIS = 110
const OBJ_H = 36

export default function ShadowTheatre() {
  const [tab, setTab] = useState<'shadow' | 'pinhole'>('shadow')
  return (
    <LabFrame labId="shadow-theatre" title="Shadow Theatre" subtitle="Light travels in straight lines. Shadows and pinhole cameras prove it!" howTo={<p>Tab 1: slide the puppet between the lamp and the screen and watch the shadow change. Try different materials. Tab 2: point a pinhole camera at the Qutub Minar and move closer or further away.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['shadow', '🎭 Shadows'], ['pinhole', '📷 Pinhole camera']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'shadow' ? <Shadows /> : <Pinhole />}
    </LabFrame>
  )
}

function Shadows() {
  const [x, setX] = useState(140)
  const [mid, setMid] = useState('cardboard')
  const m = MATERIALS.find((q) => q.id === mid)!
  const d1 = x - LIGHT_X
  const d2 = SCREEN_X - LIGHT_X
  const sh = shadowHeight(OBJ_H, d1, d2)
  const top = AXIS - sh / 2
  const shadowOpacity = m.kind === 'opaque' ? 0.85 : m.kind === 'translucent' ? 0.35 : 0.04
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 220" className="w-full rounded-2xl border bg-slate-900" role="img" aria-label={`${m.name} puppet ${d1} units from the lamp; shadow height ${sh.toFixed(0)} units`}>
        <defs>
          <radialGradient id="beam" cx="0" cy="0.5" r="1">
            <stop offset="0" stopColor="#fde68a" stopOpacity={0.5} /><stop offset="1" stopColor="#fde68a" stopOpacity={0.05} />
          </radialGradient>
        </defs>
        <polygon points={`${LIGHT_X},${AXIS} ${SCREEN_X},10 ${SCREEN_X},210`} fill="url(#beam)" />
        <rect x={SCREEN_X} y={10} width={10} height={200} fill="#f8fafc" />
        <rect x={SCREEN_X} y={top} width={10} height={sh} fill="#111827" opacity={shadowOpacity} />
        {/* straight-line edges of the shadow */}
        <line x1={LIGHT_X} y1={AXIS} x2={SCREEN_X} y2={top} stroke="#fde68a" strokeDasharray="3 4" strokeOpacity={0.7} />
        <line x1={LIGHT_X} y1={AXIS} x2={SCREEN_X} y2={top + sh} stroke="#fde68a" strokeDasharray="3 4" strokeOpacity={0.7} />
        <rect x={x - 4} y={AXIS - OBJ_H / 2} width={8} height={OBJ_H} rx={2} fill={m.kind === 'transparent' ? '#bae6fd' : m.kind === 'translucent' ? '#fef3c7' : '#a16207'} opacity={m.kind === 'transparent' ? 0.4 : 0.9} />
        <text x={LIGHT_X - 6} y={AXIS + 6} fontSize={18}>💡</text>
        <text x={SCREEN_X - 8} y={206} fontSize={9} fill="#cbd5e1" textAnchor="end">screen</text>
      </svg>
      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <label className="block text-sm">Puppet position (distance from lamp): <b>{d1} cm</b>
            <Slider value={[x]} min={90} max={SCREEN_X - 10} step={5} onValueChange={([v]) => setX(v)} className="mt-1.5" aria-label="Distance from the lamp" />
          </label>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((q) => (
              <button key={q.id} type="button" onClick={() => setMid(q.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', q.id === mid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{q.emoji} {q.name}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Readout label="Puppet height" value={`${OBJ_H / 6} cm`} />
          <Readout label="Shadow height" value={m.kind === 'transparent' ? 'no shadow' : `${(sh / 6).toFixed(1)} cm`} />
        </div>
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {m.kind === 'transparent' ? `${m.name} is transparent: almost all light passes straight through, so there is hardly any shadow.` : m.kind === 'translucent' ? `${m.name} is translucent: some light passes through, so the shadow is faint.` : `${m.name} is opaque: it blocks light completely, making a dark shadow.`} {m.kind !== 'transparent' && 'Move the puppet closer to the lamp and the shadow grows, because light travels in straight lines that spread out from the lamp.'}
      </p>
    </div>
  )
}

function Pinhole() {
  const [dist, setDist] = useState(40) // metres from the minar
  const H = 73 // Qutub Minar is about 73 m tall
  const depth = 0.2 // 20 cm camera box
  const img = pinholeImage(H, dist, depth) * 100 // cm
  const px = Math.min(80, img * 12)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 200" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`Pinhole camera ${dist} m from the Qutub Minar; upside-down image ${img.toFixed(1)} cm tall`}>
        <text x={30} y={165} fontSize={70}>🗼</text>
        <line x1={60} y1={100} x2={290} y2={100} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.5} />
        <line x1={60} y1={95} x2={290} y2={160} stroke="#f59e0b" strokeDasharray="4 4" />
        <line x1={60} y1={165} x2={290} y2={80} stroke="#f59e0b" strokeDasharray="4 4" />
        <text x={40} y={190} fontSize={10} className="fill-muted-foreground">{dist} m away</text>
        <rect x={290} y={40} width={90} height={120} fill="#334155" rx={4} />
        <circle cx={290} cy={100} r={2.5} fill="#fde68a" />
        <rect x={376} y={50} width={4} height={100} fill="#f8fafc" />
        <text x={378} y={100 + px / 2} fontSize={Math.max(8, px)} textAnchor="middle" transform={`rotate(180 378 ${100})`} dominantBaseline="middle">🗼</text>
        <text x={335} y={178} fontSize={10} textAnchor="middle" className="fill-muted-foreground">20 cm box</text>
      </svg>
      <label className="block text-sm">Distance from the Qutub Minar: <b>{dist} m</b>
        <Slider value={[dist]} min={20} max={200} step={10} onValueChange={([v]) => setDist(v)} className="mt-1.5" aria-label="Distance from the minar" />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Readout label="Minar height" value={`${H} m`} />
        <Readout label="Image on the screen" value={`${img.toFixed(1)} cm, upside down`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Rays from the top of the minar travel in a straight line through the pinhole and land at the <b>bottom</b> of the screen; rays from the bottom land at the top. So the image is <b>upside down</b>. Move further away and the image shrinks.</p>
    </div>
  )
}
