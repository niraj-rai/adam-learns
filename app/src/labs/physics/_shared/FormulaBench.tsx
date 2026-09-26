import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Readout } from '../../_kit/LabFrame'
import { lensImage, mirrorImage, power } from './optics'

type El = 'concave-mirror' | 'convex-mirror' | 'convex-lens' | 'concave-lens'
const LABEL: Record<El, string> = { 'concave-mirror': 'Concave mirror', 'convex-mirror': 'Convex mirror', 'convex-lens': 'Convex lens', 'concave-lens': 'Concave lens' }
const f2 = (x: number) => (Number.isFinite(x) ? (Math.round(x * 10) / 10).toString().replace('-', '−') : '∞')

/** Quantitative mirror/lens bench using the New Cartesian sign convention. */
export function FormulaBench({ kind }: { kind: 'mirror' | 'lens' }) {
  const opts: El[] = kind === 'mirror' ? ['concave-mirror', 'convex-mirror'] : ['convex-lens', 'concave-lens']
  const [el, setEl] = useState<El>(opts[0])
  const [dist, setDist] = useState(30)
  const [focal, setFocal] = useState(15)
  const [h, setH] = useState(3)
  const f = el === 'concave-mirror' || el === 'concave-lens' ? -focal : focal
  const u = -dist
  const r = kind === 'mirror' ? mirrorImage(u, f) : lensImage(u, f)
  // drawing: pole/optical centre at x = 300; 4 px per cm
  const PX = 300
  const AX = 120
  const S = 4
  const X = (d: number) => PX + d * S
  const objTop = AX - h * 12
  const imgH = Number.isFinite(r.m) ? r.m * h : 0
  const showImg = Number.isFinite(r.v) && Math.abs(r.v) < 80 && Math.abs(imgH) < 9
  const imgX = X(r.v)
  const imgTop = AX - imgH * 12
  const nature = !Number.isFinite(r.v) ? 'Image at infinity (object at the focus)' : `${r.real ? 'Real' : 'Virtual'}, ${r.upright ? 'upright' : 'inverted'}, ${Math.abs(r.m) > 1.02 ? 'magnified' : Math.abs(r.m) < 0.98 ? 'diminished' : 'same size'}`
  return (
    <div>
      <div className="flex flex-wrap gap-1">{opts.map((o) => <button key={o} type="button" aria-pressed={el === o} onClick={() => setEl(o)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', el === o ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{LABEL[o]}</button>)}</div>
      <svg viewBox="0 0 600 240" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={`${LABEL[el]}: object ${dist} cm away, image ${nature}`}>
        <line x1={0} y1={AX} x2={600} y2={AX} stroke="currentColor" strokeOpacity={0.4} />
        {kind === 'mirror'
          ? <path d={el === 'concave-mirror' ? `M${PX - 12},20 Q${PX + 10},${AX} ${PX - 12},220` : `M${PX + 12},20 Q${PX - 10},${AX} ${PX + 12},220`} fill="none" stroke="#0284c7" strokeWidth={4} />
          : el === 'convex-lens' ? <ellipse cx={PX} cy={AX} rx={9} ry={95} fill="#7dd3fc" fillOpacity={0.4} stroke="#0284c7" /> : <path d={`M${PX - 10},25 Q${PX},${AX} ${PX - 10},215 L${PX + 10},215 Q${PX},${AX} ${PX + 10},25 Z`} fill="#7dd3fc" fillOpacity={0.4} stroke="#0284c7" />}
        {[f, kind === 'mirror' ? 2 * f : -f].map((p, i) => Math.abs(p * S) < 300 && <g key={i}><circle cx={X(p)} cy={AX} r={3} fill="#dc2626" /><text x={X(p)} y={AX + 16} textAnchor="middle" fontSize={10} fill="#dc2626">{kind === 'mirror' ? (i ? 'C' : 'F') : 'F'}</text></g>)}
        <line x1={X(u)} y1={AX} x2={X(u)} y2={objTop} stroke="#16a34a" strokeWidth={3} markerEnd="url(#fb-arrow)" />
        <text x={X(u)} y={objTop - 6} textAnchor="middle" fontSize={10} fill="#16a34a">object</text>
        {/* ray 1: parallel to axis, then through (or away from) F */}
        <line x1={X(u)} y1={objTop} x2={PX} y2={objTop} stroke="#f59e0b" strokeWidth={1.5} />
        {showImg && <line x1={PX} y1={objTop} x2={imgX} y2={imgTop} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray={r.real ? undefined : '4 3'} />}
        {/* ray 2: through the pole / optical centre */}
        {showImg && <line x1={X(u)} y1={objTop} x2={imgX} y2={imgTop} stroke="#a855f7" strokeWidth={1.5} strokeDasharray={r.real ? undefined : '4 3'} opacity={0.8} />}
        {showImg && <><line x1={imgX} y1={AX} x2={imgX} y2={imgTop} stroke="#dc2626" strokeWidth={3} strokeDasharray={r.real ? undefined : '5 3'} /><text x={imgX} y={imgTop + (imgH > 0 ? -6 : 14)} textAnchor="middle" fontSize={10} fill="#dc2626">image</text></>}
        <defs><marker id="fb-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" /></marker></defs>
        <text x={8} y={16} fontSize={10} fill="currentColor" opacity={0.7}>← negative distances · pole/centre at 0 · positive →</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Object distance <b>{dist} cm</b> (u = −{dist})<Slider value={[dist]} min={4} max={70} step={1} onValueChange={([v]) => setDist(v)} className="mt-1" aria-label="object distance" /></label>
        <label className="text-sm">Focal length <b>{focal} cm</b> (f = {f2(f)})<Slider value={[focal]} min={5} max={30} step={1} onValueChange={([v]) => setFocal(v)} className="mt-1" aria-label="focal length" /></label>
        <label className="text-sm">Object height <b>{h} cm</b><Slider value={[h]} min={1} max={6} step={1} onValueChange={([v]) => setH(v)} className="mt-1" aria-label="object height" /></label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Readout label={kind === 'mirror' ? '1/v + 1/u = 1/f' : '1/v − 1/u = 1/f'} value={`v = ${f2(r.v)} cm`} />
        <Readout label={kind === 'mirror' ? 'm = −v/u' : 'm = v/u'} value={f2(r.m)} />
        <Readout label="Image height h′ = m × h" value={`${f2(r.m * h)} cm`} />
        {kind === 'lens' ? <Readout label="Power P = 1/f (m)" value={`${f2(power(f / 100))} D`} /> : <Readout label="Radius of curvature R = 2f" value={`${f2(2 * f)} cm`} />}
      </div>
      <p className="mt-2 rounded-xl bg-muted/60 px-3 py-2 text-sm"><b>Image:</b> {nature}. {Number.isFinite(r.v) && (kind === 'mirror' ? (r.v < 0 ? 'v is negative: the image is in front of the mirror.' : 'v is positive: the image is behind the mirror.') : (r.v > 0 ? 'v is positive: the image is on the other side of the lens.' : 'v is negative: the image is on the same side as the object.'))} A negative m means inverted.</p>
    </div>
  )
}
