import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { periscopeTrace, readsSameInMirror } from './model'

export default function MirrorImages() {
  const [tab, setTab] = useState<'name' | 'distance' | 'periscope'>('name')
  return (
    <LabFrame labId="mirror-images" title="Mirror Images" subtitle="What does a plane mirror really do to an image? And how can two mirrors help you see over a wall?" howTo={<p>Tab 1: type a word and see it in a mirror. Can you find words that look the same? Tab 2: move a diya towards a mirror and watch its image. Tab 3: angle two mirrors to build a working periscope.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['name', '🔤 Mirror writing'], ['distance', '🪔 Image distance'], ['periscope', '🔭 Periscope']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'name' && <MirrorWriting />}
      {tab === 'distance' && <ImageDistance />}
      {tab === 'periscope' && <Periscope />}
    </LabFrame>
  )
}

function MirrorWriting() {
  const [word, setWord] = useState('ADAM')
  const same = readsSameInMirror(word)
  return (
    <div className="space-y-3">
      <input value={word} maxLength={16} onChange={(e) => setWord(e.target.value.toUpperCase())} aria-label="Type a word" className="w-full rounded-md border bg-background px-3 py-2 font-heading text-lg tracking-widest" />
      <div className="grid grid-cols-[1fr_8px_1fr] items-center rounded-2xl border bg-background p-4">
        <p className="text-center font-heading text-3xl font-bold tracking-widest">{word || ' '}</p>
        <div className="h-16 rounded bg-gradient-to-b from-slate-300 to-slate-500" aria-hidden />
        <p className="text-center font-heading text-3xl font-bold tracking-widest text-muted-foreground" style={{ transform: 'scaleX(-1)' }} aria-label={`Mirror image of ${word}`}>{word || ' '}</p>
      </div>
      <p role="status" className={cn('rounded-lg px-3 py-2 text-sm', same ? 'bg-success-soft' : 'bg-chem-soft')}>
        {same ? `✨ ${word} reads the same in a mirror! Every letter is symmetrical, and the word is a palindrome.` : 'Left and right are swapped: this is lateral inversion. Challenge: find a word that looks exactly the same in the mirror. (Hint: use only letters like A, H, I, M, O, T, U, V, W, X, Y.)'}
      </p>
      <p className="text-sm text-muted-foreground">🚑 That's why AMBULANCE is written in mirror writing on the front of ambulances: drivers see it the right way round in their rear-view mirrors.</p>
    </div>
  )
}

function ImageDistance() {
  const [d, setD] = useState(60)
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 140" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Diya ${d} cm in front of the mirror; image ${d} cm behind`}>
        <rect x={197} y={10} width={6} height={120} fill="#94a3b8" />
        <rect x={203} y={10} width={197} height={120} fill="#94a3b8" opacity={0.08} />
        <text x={200 - d * 1.6} y={100} fontSize={28} textAnchor="middle">🪔</text>
        <text x={200 + d * 1.6} y={100} fontSize={28} textAnchor="middle" opacity={0.5} style={{ transform: 'scaleX(-1)', transformOrigin: `${200 + d * 1.6}px 90px` }}>🪔</text>
        <line x1={200 - d * 1.6} y1={115} x2={200} y2={115} stroke="#f97316" />
        <line x1={200} y1={115} x2={200 + d * 1.6} y2={115} stroke="#f97316" strokeDasharray="4 3" />
        <text x={200 - d * 0.8} y={130} fontSize={10} textAnchor="middle" className="fill-foreground">{d} cm</text>
        <text x={200 + d * 0.8} y={130} fontSize={10} textAnchor="middle" className="fill-foreground">{d} cm</text>
        <text x={300} y={24} fontSize={10} textAnchor="middle" className="fill-muted-foreground">image (behind the mirror)</text>
      </svg>
      <label className="block text-sm">Distance of the diya from the mirror: <b>{d} cm</b>
        <Slider value={[d]} min={10} max={110} step={5} onValueChange={([v]) => setD(v)} className="mt-1.5" aria-label="Diya distance from mirror" />
      </label>
      <div className="grid grid-cols-3 gap-2">
        <Readout label="Image distance" value={`${d} cm behind`} />
        <Readout label="Size" value="same as the diya" />
        <Readout label="Type" value="virtual, upright" />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">A plane mirror forms an image that is <b>as far behind</b> the mirror as the object is in front, the <b>same size</b>, <b>upright</b> and <b>virtual</b> (it can't be caught on a screen). It is also laterally inverted.</p>
    </div>
  )
}

function Periscope() {
  const [top, setTop] = useState(30)
  const [bottom, setBottom] = useState(60)
  const r = periscopeTrace(top, bottom)
  useEffect(() => {
    if (r.works) sfx.win()
  }, [r.works])
  const X = 200
  const Y1 = 40
  const Y2 = 170
  const mirror = (cx: number, cy: number, deg: number) => {
    const a = (deg * Math.PI) / 180
    return { x1: cx - 22 * Math.cos(a), y1: cy + 22 * Math.sin(a), x2: cx + 22 * Math.cos(a), y2: cy - 22 * Math.sin(a) }
  }
  const m1 = mirror(X, Y1, top)
  const m2 = mirror(X, Y2, bottom)
  // first leg after the top mirror (SVG y is down, so flip dy)
  const leg1 = r.downTube ? { x: X, y: Y2 } : { x: X + r.d1.dx * 70, y: Y1 - r.d1.dy * 70 }
  const leg2 = r.d2 ? { x: X + r.d2.dx * 120, y: Y2 - r.d2.dy * 120 } : null
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 400 210" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={r.works ? 'Periscope working: light reaches the eye' : 'Periscope not working yet'}>
        <rect x={250} y={80} width={40} height={130} fill="#a8a29e" />
        <text x={270} y={200} textAnchor="middle" fontSize={9} fill="#fff">wall</text>
        <text x={345} y={50} fontSize={28}>🏏</text>
        <rect x={X - 25} y={Y1 - 25} width={50} height={Y2 - Y1 + 50} fill="none" stroke="#475569" strokeWidth={2} />
        <line x1={380} y1={Y1} x2={X} y2={Y1} stroke="#ef4444" strokeWidth={2.5} />
        <line x1={X} y1={Y1} x2={leg1.x} y2={leg1.y} stroke="#ef4444" strokeWidth={2.5} />
        {leg2 && <line x1={X} y1={Y2} x2={leg2.x} y2={leg2.y} stroke="#ef4444" strokeWidth={2.5} />}
        <line {...m1} stroke="#0ea5e9" strokeWidth={5} strokeLinecap="round" />
        <line {...m2} stroke="#0ea5e9" strokeWidth={5} strokeLinecap="round" />
        <text x={60} y={Y2 + 8} fontSize={26}>{r.works ? '😃' : '🧐'}</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Top mirror angle: <b>{top}°</b>
          <Slider value={[top]} min={0} max={90} step={5} onValueChange={([v]) => setTop(v)} className="mt-1.5" aria-label="Top mirror angle" />
        </label>
        <label className="block text-sm">Bottom mirror angle: <b>{bottom}°</b>
          <Slider value={[bottom]} min={0} max={90} step={5} onValueChange={([v]) => setBottom(v)} className="mt-1.5" aria-label="Bottom mirror angle" />
        </label>
      </div>
      <motion.p key={String(r.works)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" className={cn('rounded-xl px-4 py-2 text-sm', r.works ? 'bg-success-soft' : 'bg-chem-soft')}>
        {r.works ? '✅ You can see the cricket match over the wall! Both mirrors are at 45° and parallel, so each turns the light through 90°. Submarines and soldiers in trenches use periscopes.' : !r.downTube ? 'The top mirror isn’t sending the light down the tube. Remember: angle of incidence = angle of reflection.' : 'The light reaches the bottom mirror, but it isn’t going into your eye yet.'}
      </motion.p>
    </div>
  )
}
