import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { useProgress } from '@/stores/progress'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ELEMENTS, type ElementId, imageOf, type Image, objectZone } from './model'

const W = 480
const AX = 120 // principal axis y
const PX = 240 // pole / optical centre x
const S = 4 // pixels per cm
const OBJ = 24 // object height in px

type Challenge = { id: string; el: ElementId; text: string; ok: (i: Image) => boolean }
const CHALLENGES: Challenge[] = [
  { id: 'shaving', el: 'concave-mirror', text: 'Concave mirror: make an upright, magnified image, like a shaving or make-up mirror.', ok: (i) => !i.atInfinity && i.upright && i.size === 'magnified' },
  { id: 'same', el: 'convex-lens', text: 'Convex lens: make a real, inverted image exactly the same size as the candle.', ok: (i) => i.real && !i.upright && i.size === 'same size' },
  { id: 'camera', el: 'convex-lens', text: 'Convex lens: make a real image smaller than the candle, like a camera or your eye does.', ok: (i) => i.real && !i.atInfinity && i.size === 'diminished' },
  { id: 'magnifier', el: 'convex-lens', text: 'Convex lens: use it as a magnifying glass.', ok: (i) => !i.real && i.size === 'magnified' },
  { id: 'rearview', el: 'convex-mirror', text: 'Convex mirror: try to make a real image. (Is it possible?) Then note what kind of image you always get.', ok: (i) => !i.real && i.size === 'diminished' },
]

export default function OpticsBench({ mode }: { mode?: 'mirror' | 'lens' }) {
  const addXp = useProgress((s) => s.addXp)
  const [el, setEl] = useState<ElementId>(mode === 'lens' ? 'convex-lens' : 'concave-mirror')
  const [u, setU] = useState(40)
  const [fAbs, setFAbs] = useState(15)
  const [done, setDone] = useState<string[]>([])
  const info = ELEMENTS.find((e) => e.id === el)!
  const f = info.converging ? fAbs : -fAbs
  const img = imageOf(u, f)
  const isMirror = info.kind === 'mirror'
  const visible = ELEMENTS.filter((e) => !mode || e.kind === mode)
  const challenges = CHALLENGES.filter((c) => visible.some((e) => e.id === c.el))

  useEffect(() => {
    const hit = challenges.find((c) => c.el === el && !done.includes(c.id) && c.ok(img))
    if (hit) {
      setDone((d) => [...d, hit.id])
      addXp(5, 'Optics challenge')
      sfx.correct()
    }
  }, [el, u, fAbs]) // eslint-disable-line react-hooks/exhaustive-deps

  // screen coordinates
  const xo = PX - u * S
  const yo = AX - OBJ
  const xi = isMirror ? PX - img.v * S : PX + img.v * S
  const yi = AX - img.m * OBJ
  const fx = (d: number) => (isMirror ? PX - d * S : PX + d * S)

  // rays: each leaves the object top, hits the element at P, then heads to (or appears to come from) the image top
  const hits = [
    { x: PX, y: yo }, // parallel ray
    { x: PX, y: AX }, // ray to the pole / optical centre
  ]
  const onward = (p: { x: number; y: number }) => {
    if (img.atInfinity) {
      // rays leave parallel to the ray through the centre
      const dx = PX - xo
      const dy = AX - yo
      const dir = isMirror ? { x: -dx, y: dy } : { x: dx, y: dy }
      const len = Math.hypot(dir.x, dir.y)
      return { end: { x: p.x + (dir.x / len) * 600, y: p.y + (dir.y / len) * 600 }, back: null }
    }
    const towards = img.real ? { x: xi - p.x, y: yi - p.y } : { x: p.x - xi, y: p.y - yi }
    const len = Math.hypot(towards.x, towards.y) || 1
    return { end: { x: p.x + (towards.x / len) * 600, y: p.y + (towards.y / len) * 600 }, back: img.real ? null : { x: xi, y: yi } }
  }

  const R = 2 * fAbs * S
  const elementShape = () => {
    if (el === 'convex-lens') return <ellipse cx={PX} cy={AX} rx={8} ry={70} fill="#7dd3fc" fillOpacity={0.35} stroke="#0284c7" />
    if (el === 'concave-lens') return <path d={`M${PX - 10} ${AX - 70} Q ${PX} ${AX} ${PX - 10} ${AX + 70} L ${PX + 10} ${AX + 70} Q ${PX} ${AX} ${PX + 10} ${AX - 70} Z`} fill="#7dd3fc" fillOpacity={0.35} stroke="#0284c7" />
    const sweep = el === 'concave-mirror' ? 1 : 0
    const dy = Math.min(70, R * 0.9)
    const dx = R - Math.sqrt(R * R - dy * dy)
    const x = el === 'concave-mirror' ? PX - dx : PX + dx
    return <path d={`M ${x} ${AX - dy} A ${R} ${R} 0 0 ${sweep} ${x} ${AX + dy}`} fill="none" stroke="#0ea5e9" strokeWidth={4} />
  }

  const describe = img.atInfinity
    ? 'No clear image: the reflected/refracted rays come out parallel (the image is “at infinity”). This is how a torch makes a straight beam.'
    : `${img.real ? 'Real' : 'Virtual'}, ${img.upright ? 'upright' : 'inverted'} and ${img.size}. ${img.real ? 'A real image can be caught on a screen.' : 'A virtual image cannot be caught on a screen: you see it only by looking into the ' + (isMirror ? 'mirror.' : 'lens.')}`

  return (
    <LabFrame labId="optics-bench" title="Optics Bench" subtitle="Move the candle and trace the rays. Where does the image form, and what is it like?" howTo={<p>Choose a mirror or lens, then slide the candle along the bench. Two rays from the top of the flame show where the image forms. Complete the challenges below. Dashed lines show where light only <i>appears</i> to come from (a virtual image).</p>}>
      <div className="mb-3 flex flex-wrap gap-2">
        {visible.map((e) => (
          <button key={e.id} type="button" onClick={() => setEl(e.id)} className={cn('rounded-full border px-3 py-1.5 text-sm', e.id === el ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{e.name}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} 240`} className="w-full rounded-2xl border bg-slate-900" role="img" aria-label={`${info.name}, candle ${u} cm away, focal length ${fAbs} cm. Image: ${describe}`}>
        <line x1={0} y1={AX} x2={W} y2={AX} stroke="#64748b" />
        {[1, 2].map((k) => (
          <g key={k}>
            <circle cx={fx(k * f)} cy={AX} r={3} fill="#fbbf24" />
            <text x={fx(k * f)} y={AX + 16} fontSize={10} fill="#fbbf24" textAnchor="middle">{k === 1 ? 'F' : isMirror ? 'C' : '2F'}</text>
            {!isMirror && (
              <>
                <circle cx={PX - (k * f) * S} cy={AX} r={3} fill="#fbbf24" />
                <text x={PX - k * f * S} y={AX + 16} fontSize={10} fill="#fbbf24" textAnchor="middle">{k === 1 ? 'F' : '2F'}</text>
              </>
            )}
          </g>
        ))}
        {elementShape()}
        {/* object: a candle drawn as an arrow */}
        <line x1={xo} y1={AX} x2={xo} y2={yo} stroke="#f97316" strokeWidth={3} />
        <text x={xo} y={yo - 4} fontSize={14} textAnchor="middle">🔥</text>
        {hits.map((p, k) => {
          const o = onward(p)
          return (
            <g key={k} stroke={k ? '#a78bfa' : '#f472b6'} strokeWidth={1.6}>
              <line x1={xo} y1={yo} x2={p.x} y2={p.y} />
              <line x1={p.x} y1={p.y} x2={o.end.x} y2={o.end.y} />
              {o.back && <line x1={p.x} y1={p.y} x2={o.back.x} y2={o.back.y} strokeDasharray="4 4" opacity={0.8} />}
            </g>
          )
        })}
        {!img.atInfinity && Math.abs(xi) < 2000 && (
          <g opacity={img.real ? 1 : 0.6}>
            <line x1={xi} y1={AX} x2={xi} y2={yi} stroke="#f97316" strokeWidth={3} strokeDasharray={img.real ? undefined : '4 3'} />
            <circle cx={xi} cy={yi} r={3} fill="#f97316" />
          </g>
        )}
      </svg>
      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <label className="block text-sm">Candle distance from the {isMirror ? 'mirror' : 'lens'}: <b>{u} cm</b> <span className="text-muted-foreground">({objectZone(u, f)})</span>
            <Slider value={[u]} min={3} max={58} step={1} onValueChange={([v]) => setU(v)} className="mt-1.5" aria-label="Object distance" />
          </label>
          <label className="block text-sm">Focal length: <b>{fAbs} cm</b>
            <Slider value={[fAbs]} min={8} max={20} step={1} onValueChange={([v]) => setFAbs(v)} className="mt-1.5" aria-label="Focal length" />
          </label>
          <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm"><b>Image:</b> {describe}</p>
          <p className="text-xs text-muted-foreground"><b>Uses of a {info.name.toLowerCase()}:</b> {info.uses}.</p>
        </div>
        <div className="space-y-2">
          <Readout label="Image distance" value={img.atInfinity ? '∞' : `${Math.abs(img.v).toFixed(1)} cm ${img.real ? (isMirror ? 'in front' : 'beyond the lens') : isMirror ? 'behind the mirror' : 'on the candle’s side'}`} />
          <Readout label="Magnification" value={img.atInfinity ? '–' : `× ${Math.abs(img.m).toFixed(2)}`} />
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <p className="text-sm font-semibold">Challenges</p>
        {challenges.map((c) => (
          <p key={c.id} className={cn('rounded-lg border px-3 py-1.5 text-sm', done.includes(c.id) && 'border-success bg-success-soft')}>{done.includes(c.id) ? '✅' : '⬜'} {c.text}</p>
        ))}
      </div>
    </LabFrame>
  )
}
