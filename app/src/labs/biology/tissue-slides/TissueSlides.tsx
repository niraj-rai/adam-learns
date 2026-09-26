import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ANIMAL_TISSUES } from './model'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)

const DRAW: Record<string, ReactNode> = {
  squamous: <g>{range(5).flatMap((r) => range(6).map((c) => <path key={`${r}${c}`} d={`M${20 + c * 45 + (r % 2) * 20},${20 + r * 32} l20,-8 l22,6 l2,22 l-22,8 l-20,-6 z`} fill="#fbcfe8" stroke="#be185d" strokeWidth={1.5} />)).concat(range(12).map((i) => <circle key={`n${i}`} cx={40 + (i % 6) * 45 + (Math.floor(i / 6) % 2) * 20} cy={30 + Math.floor(i / 6) * 64} r={4} fill="#831843" />))}</g>,
  columnar: <g>{range(10).map((i) => <g key={i}><rect x={15 + i * 27} y={40} width={25} height={100} fill="#fbcfe8" stroke="#be185d" strokeWidth={1.5} /><ellipse cx={27 + i * 27} cy={115} rx={6} ry={9} fill="#831843" />{range(4).map((k) => <line key={k} x1={18 + i * 27 + k * 6} y1={40} x2={18 + i * 27 + k * 6} y2={30} stroke="#be185d" />)}</g>)}</g>,
  blood: <g><rect x={0} y={0} width={300} height={180} fill="#fef3c7" />{range(26).map((i) => <g key={i}><circle cx={20 + ((i * 67) % 270)} cy={20 + ((i * 41) % 150)} r={11} fill="#ef4444" /><circle cx={20 + ((i * 67) % 270)} cy={20 + ((i * 41) % 150)} r={4} fill="#fca5a5" /></g>)}<circle cx={150} cy={90} r={15} fill="#e9d5ff" stroke="#7c3aed" /><path d="M142,86 q8,-10 16,0 q-8,10 -16,0" fill="#7c3aed" />{range(6).map((i) => <circle key={`p${i}`} cx={60 + i * 35} cy={165} r={2.5} fill="#a855f7" />)}</g>,
  bone: <g><rect x={0} y={0} width={300} height={180} fill="#f5f5f4" />{[[80, 90], [210, 90]].map(([x, y], k) => <g key={k}>{range(4).map((r) => <circle key={r} cx={x} cy={y} r={14 + r * 16} fill="none" stroke="#a8a29e" strokeWidth={2} />)}<circle cx={x} cy={y} r={9} fill="#78716c" />{range(14).map((i) => { const a = (i / 14) * Math.PI * 2; const rr = 22 + (i % 3) * 16; return <ellipse key={i} cx={x + rr * Math.cos(a)} cy={y + rr * Math.sin(a)} rx={4} ry={2} fill="#44403c" /> })}</g>)}</g>,
  cartilage: <g><rect x={0} y={0} width={300} height={180} fill="#e0f2fe" />{range(14).map((i) => <g key={i}><ellipse cx={30 + ((i * 83) % 250)} cy={25 + ((i * 53) % 135)} rx={16} ry={11} fill="#bae6fd" stroke="#0284c7" /><circle cx={24 + ((i * 83) % 250)} cy={25 + ((i * 53) % 135)} r={4} fill="#075985" /><circle cx={36 + ((i * 83) % 250)} cy={25 + ((i * 53) % 135)} r={4} fill="#075985" /></g>)}</g>,
  skeletal: <g>{range(4).map((r) => <g key={r}><rect x={10} y={15 + r * 42} width={280} height={34} rx={14} fill="#fecaca" stroke="#b91c1c" />{range(40).map((k) => <line key={k} x1={18 + k * 7} y1={17 + r * 42} x2={18 + k * 7} y2={47 + r * 42} stroke="#b91c1c" strokeOpacity={k % 2 ? 0.2 : 0.55} strokeWidth={3} />)}{range(4).map((k) => <ellipse key={`n${k}`} cx={45 + k * 70} cy={20 + r * 42} rx={7} ry={3} fill="#7f1d1d" />)}</g>)}</g>,
  smooth: <g>{range(12).map((i) => <g key={i} transform={`translate(${25 + (i % 4) * 70},${25 + Math.floor(i / 4) * 55})`}><path d="M0,15 Q30,-2 60,15 Q30,32 0,15 Z" fill="#fecaca" stroke="#b91c1c" /><ellipse cx={30} cy={15} rx={7} ry={3} fill="#7f1d1d" /></g>)}</g>,
  cardiac: <g>{range(3).map((r) => <g key={r}><path d={`M10,${30 + r * 55} L120,${30 + r * 55} L160,${55 + r * 55} L290,${55 + r * 55} L290,${80 + r * 55} L160,${80 + r * 55} L120,${55 + r * 55} L10,${55 + r * 55} Z`} fill="#fecaca" stroke="#b91c1c" />{range(38).map((k) => <line key={k} x1={14 + k * 7.5} y1={30 + r * 55 + (k > 16 ? 25 : 0)} x2={14 + k * 7.5} y2={55 + r * 55 + (k > 16 ? 25 : 0)} stroke="#b91c1c" strokeOpacity={0.35} strokeWidth={2} />)}<line x1={140} y1={40 + r * 55} x2={140} y2={70 + r * 55} stroke="#7f1d1d" strokeWidth={4} /><ellipse cx={70} cy={42 + r * 55} rx={6} ry={4} fill="#7f1d1d" /><ellipse cx={220} cy={67 + r * 55} rx={6} ry={4} fill="#7f1d1d" /></g>)}</g>,
  nerve: <g><circle cx={80} cy={90} r={26} fill="#ddd6fe" stroke="#6d28d9" strokeWidth={2} /><circle cx={80} cy={90} r={9} fill="#5b21b6" />{range(7).map((i) => { const a = Math.PI * 0.6 + (i / 6) * Math.PI * 0.8; return <path key={i} d={`M${80 + 26 * Math.cos(a)},${90 + 26 * Math.sin(a)} l${30 * Math.cos(a)},${30 * Math.sin(a)} l${10 * Math.cos(a + 0.6)},${10 * Math.sin(a + 0.6)}`} fill="none" stroke="#6d28d9" strokeWidth={2} /> })}<path d="M106,90 L260,90" stroke="#6d28d9" strokeWidth={4} />{range(5).map((i) => <rect key={i} x={120 + i * 28} y={84} width={20} height={12} rx={5} fill="#c4b5fd" />)}<path d="M260,90 l20,-15 M260,90 l22,0 M260,90 l20,15" stroke="#6d28d9" strokeWidth={2} /></g>,
}

export default function TissueSlides() {
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const order = useMemo(() => shuffle(ANIMAL_TISSUES.map((t) => t.id)), [])
  const cur = ANIMAL_TISSUES.find((t) => t.id === order[round % order.length])!
  const options = useMemo(() => shuffle([cur, ...shuffle(ANIMAL_TISSUES.filter((t) => t.id !== cur.id)).slice(0, 3)]), [cur])
  const choose = (id: string) => {
    if (picked) return
    setPicked(id)
    if (id === cur.id) { sfx.correct(); setScore((s) => s + 1) } else sfx.wrong()
  }
  return (
    <LabFrame labId="tissue-slides" title="Tissue Slides" subtitle="Epithelial, connective, muscular and nervous: identify animal tissues under the microscope." howTo={<p>Look closely at the slide. Choose the tissue it shows, then read why. Use the shapes of the cells, the nuclei and the stripes as clues.</p>}>
      <div className="flex items-center justify-between text-sm"><span>Slide {(round % order.length) + 1} of {order.length}</span><span className="font-semibold">Score {score}</span></div>
      <div className="mt-2 grid gap-4 md:grid-cols-[1fr_1fr]">
        <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-full border-8 border-slate-700 bg-white">
          <svg viewBox="0 0 300 180" className="absolute inset-0 m-auto h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Microscope slide of an animal tissue">{DRAW[cur.id]}</svg>
        </div>
        <div className="space-y-2">
          {options.map((o) => (
            <button key={o.id} type="button" disabled={Boolean(picked)} onClick={() => choose(o.id)} className={cn('block w-full rounded-xl border-2 px-3 py-2 text-left text-sm', !picked && 'hover:border-chem', picked && o.id === cur.id && 'border-success bg-success-soft', picked === o.id && o.id !== cur.id && 'border-destructive/60 bg-destructive/10')}>{o.name}</button>
          ))}
          {picked && (
            <div className="rounded-xl bg-muted/60 p-3 text-sm">
              <p className="font-semibold">{picked === cur.id ? '✅ ' : '❌ '}{cur.name} <span className="font-normal text-muted-foreground">({cur.type} tissue)</span></p>
              <p className="mt-1"><b>Look for:</b> {cur.features}</p>
              <p><b>Where:</b> {cur.where}</p>
              <p><b>Job:</b> {cur.job}</p>
              <Button className="mt-2" size="sm" onClick={() => { setRound((r) => r + 1); setPicked(null) }}>Next slide →</Button>
            </div>
          )}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Animals have four basic tissues: <b>epithelial</b> (covers and lines), <b>connective</b> (supports and connects; includes blood, bone and cartilage), <b>muscular</b> (moves: skeletal, smooth and cardiac) and <b>nervous</b> (sends messages).</p>
    </LabFrame>
  )
}
