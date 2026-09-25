import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { barField, fieldLine, OBJECTS } from './model'

export default function MagnetLab() {
  const [tab, setTab] = useState<'test' | 'field' | 'earth'>('test')
  return (
    <LabFrame labId="magnet-lab" title="Magnet Lab" subtitle="Which materials are magnetic? What does a magnetic field look like? Why does a compass point north?" howTo={<p>Tab 1: test objects with a magnet. Tab 2: click around the magnet to place compasses, then sprinkle iron filings. Tab 3: hang a magnet freely and see which way it turns.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['test', '🧲 Magnetic or not?'], ['field', '🧭 Field mapper'], ['earth', '🌍 Earth is a magnet']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'test' && <Tester />}
      {tab === 'field' && <FieldMapper />}
      {tab === 'earth' && <Earth />}
    </LabFrame>
  )
}

function Tester() {
  const [tested, setTested] = useState<string[]>([])
  const [last, setLast] = useState<string | null>(null)
  const o = OBJECTS.find((x) => x.id === last)
  return (
    <div className="space-y-3">
      <div className="flex min-h-24 items-center justify-center gap-6 rounded-2xl border bg-background p-4">
        <span className="text-5xl">🧲</span>
        {o && (
          <motion.span key={o.id} className="text-4xl" initial={{ x: 60 }} animate={{ x: o.magnetic ? -10 : 60 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>{o.emoji}</motion.span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {OBJECTS.map((x) => (
          <button key={x.id} type="button" onClick={() => { setLast(x.id); setTested((t) => (t.includes(x.id) ? t : [...t, x.id])) }} className={cn('rounded-full border px-3 py-1.5 text-sm', last === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {x.emoji} {x.name}{tested.includes(x.id) ? (x.magnetic ? ' 🧲' : ' ✖') : ''}
          </button>
        ))}
      </div>
      {o && <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">{o.magnetic ? `${o.name} is attracted: it contains iron (steel is mostly iron).` : `${o.name} is not attracted. ${['can', 'copper', 'brass', 'gold'].includes(o.id) ? 'It is a metal, but not a magnetic one! Only a few metals (iron, nickel, cobalt) are magnetic.' : 'Non-metals are not magnetic.'}`}</p>}
      <Readout label="Objects tested" value={`${tested.length} / ${OBJECTS.length}`} />
    </div>
  )
}

const W = 400
const H = 260
const S = 50 // px per model unit
const toPx = (x: number, y: number) => [W / 2 + x * S, H / 2 - y * S] as const
const toModel = (px: number, py: number) => [(px - W / 2) / S, (H / 2 - py) / S] as const

function FieldMapper() {
  const [compasses, setCompasses] = useState<[number, number][]>([[3, 0], [0, 1.6]])
  const [filings, setFilings] = useState(false)
  const lines = useMemo(() => {
    const out: [number, number][][] = []
    for (let k = 0; k < 14; k++) {
      const a = (k / 14) * 2 * Math.PI
      out.push(fieldLine(1 + 0.12 * Math.cos(a), 0.12 * Math.sin(a)))
    }
    return out
  }, [])
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const [x, y] = toModel(p.x, p.y)
    if (Math.abs(y) < 0.35 && Math.abs(x) < 1.35) return // on the magnet
    setCompasses((c) => [...c.slice(-11), [x, y]])
  }
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full cursor-crosshair rounded-2xl border bg-background" onClick={click} role="img" aria-label="Bar magnet with compasses showing the field direction">
        {filings && lines.map((l, i) => <polyline key={i} points={l.map(([x, y]) => toPx(x, y).join(',')).join(' ')} fill="none" stroke="#64748b" strokeWidth={1} strokeDasharray="2 3" />)}
        <rect x={W / 2 - 1.25 * S} y={H / 2 - 0.3 * S} width={1.25 * S} height={0.6 * S} fill="#3b82f6" />
        <rect x={W / 2} y={H / 2 - 0.3 * S} width={1.25 * S} height={0.6 * S} fill="#ef4444" />
        <text x={W / 2 + 0.9 * S} y={H / 2 + 5} fill="#fff" fontSize={14} fontWeight={700}>N</text>
        <text x={W / 2 - 1.1 * S} y={H / 2 + 5} fill="#fff" fontSize={14} fontWeight={700}>S</text>
        {compasses.map(([x, y], i) => {
          const { bx, by } = barField(x, y)
          const ang = (Math.atan2(-by, bx) * 180) / Math.PI
          const [px, py] = toPx(x, y)
          return (
            <g key={i} transform={`translate(${px} ${py})`}>
              <circle r={13} fill="var(--card)" stroke="currentColor" strokeOpacity={0.4} />
              <g transform={`rotate(${ang})`}>
                <polygon points="0,-3 11,0 0,3" fill="#ef4444" />
                <polygon points="0,-3 -11,0 0,3" fill="#94a3b8" />
              </g>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filings ? 'default' : 'outline'} onClick={() => setFilings((f) => !f)}>⚫ {filings ? 'Clear' : 'Sprinkle'} iron filings</Button>
        <Button size="sm" variant="ghost" onClick={() => setCompasses([])}>Remove compasses</Button>
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Click anywhere to place a compass: its <b className="text-red-500">red (north) end</b> points along the <b>magnetic field</b>. The field lines run from the magnet's N pole round to its S pole, and they are closest together near the poles, where the magnet is strongest.</p>
    </div>
  )
}

function Earth() {
  const [hang, setHang] = useState(0)
  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <div className="relative grid aspect-square place-items-center rounded-2xl border bg-background">
        <span className="absolute top-2 text-sm font-semibold">N ↑ (geographic north)</span>
        <motion.div key={hang} initial={{ rotate: 70 }} animate={{ rotate: [70, -40, 25, -12, 6, 0] }} transition={{ duration: 3, ease: 'easeOut' }} className="flex h-40 w-8 flex-col overflow-hidden rounded" aria-label="Freely hanging bar magnet">
          <div className="grid flex-1 place-items-center bg-red-500 font-bold text-white">N</div>
          <div className="grid flex-1 place-items-center bg-blue-500 font-bold text-white">S</div>
        </motion.div>
      </div>
      <div className="space-y-3">
        <Button onClick={() => setHang((h) => h + 1)}>🪢 Hang the magnet freely</Button>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A freely suspended magnet always comes to rest pointing <b>north–south</b>. That's because the Earth itself behaves like a giant magnet. A <b>compass</b> is just a tiny, light magnet balanced on a pin.</p>
        <p className="text-sm text-muted-foreground">🤯 Twist: since unlike poles attract, the Earth's magnetic pole near the geographic North Pole is actually a magnetic <b>south</b> pole! Sailors used compasses for navigation for centuries, and so do scouts and trekkers today.</p>
      </div>
    </div>
  )
}
