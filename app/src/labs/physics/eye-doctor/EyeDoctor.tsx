import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { hypermetropiaCorrection, myopiaCorrection } from '../_shared/optics'

/** Each patient's eye focuses too strongly (+) or too weakly (−) by `error` dioptres for the test object. */
const PATIENTS = [
  { id: 'normal', name: 'Riya: normal vision', emoji: '🙂', error: 0, test: 'distant', note: 'Near point 25 cm, far point at infinity. The ciliary muscles change the lens shape to focus (accommodation).' },
  { id: 'myopia', name: 'Arjun: short-sighted (myopia)', emoji: '📚', error: -myopiaCorrection(2), test: 'distant', note: 'Far point is only 2 m. Distant objects focus in FRONT of the retina: the eyeball is too long or the lens too strong. Corrected with a concave lens.' },
  { id: 'hyper', name: 'Meera: long-sighted (hypermetropia)', emoji: '🔭', error: -hypermetropiaCorrection(1), test: 'near', note: 'Near point is 1 m. Near objects focus BEHIND the retina: the eyeball is too short or the lens too weak. Corrected with a convex lens.' },
  { id: 'presbyopia', name: 'Grandpa: presbyopia', emoji: '👴', error: -2.5, test: 'near', note: 'With age the eye lens stiffens and can’t focus on near things. Often corrected with bifocal or reading glasses.' },
]

export default function EyeDoctor() {
  const [pid, setPid] = useState('myopia')
  const [P, setP] = useState(0)
  const pt = PATIENTS.find((p) => p.id === pid)!
  const net = pt.error + P // + means focusing too strongly (in front of the retina)
  const retinaX = 330
  const focusX = retinaX - net * 55 // exaggerated so small errors are visible
  const sharp = Math.abs(net) < 0.13
  const eyeCX = 270
  const incoming = pt.test === 'distant' ? [70, 100, 130].map((y) => ({ x1: 40, y1: y, x2: 212, y2: y })) : [70, 100, 130].map((y) => ({ x1: 40, y1: 100, x2: 212, y2: y }))
  return (
    <LabFrame labId="eye-doctor" title="Eye Doctor" subtitle="Find the right spectacle lens so each patient's eye focuses light exactly on the retina." howTo={<p>Choose a patient, then change the power of the spectacle lens until the rays meet on the retina. Negative power = concave (diverging); positive = convex (converging).</p>}>
      <div className="flex flex-wrap gap-1">{PATIENTS.map((p) => <button key={p.id} type="button" aria-pressed={pid === p.id} onClick={() => { setPid(p.id); setP(0) }} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', pid === p.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{p.emoji} {p.name}</button>)}</div>
      <svg viewBox="0 0 400 200" className="mt-3 w-full rounded-2xl border bg-background" role="img" aria-label={sharp ? 'Rays focus on the retina' : 'Rays do not focus on the retina'}>
        <text x={14} y={104} fontSize={20}>{pt.test === 'distant' ? '🌳' : '📖'}</text>
        {P !== 0 && <rect x={180} y={45} width={10} height={110} rx={5} fill="#7dd3fc" fillOpacity={0.6} stroke="#0284c7" />}
        {P !== 0 && <text x={185} y={40} textAnchor="middle" fontSize={10} fill="#0284c7">{P > 0 ? '+' : ''}{P} D</text>}
        <circle cx={eyeCX} cy={100} r={62} fill="#fff7ed" stroke="#9a3412" strokeWidth={2} />
        <path d={`M${retinaX - 4},55 Q${retinaX + 6},100 ${retinaX - 4},145`} fill="none" stroke="#dc2626" strokeWidth={4} />
        <text x={retinaX + 8} y={60} fontSize={9} fill="#dc2626">retina</text>
        <ellipse cx={215} cy={100} rx={9} ry={26} fill="#bfdbfe" stroke="#1d4ed8" />
        {incoming.map((l, k) => <g key={k}><line {...l} stroke="#f59e0b" strokeWidth={1.8} /><line x1={l.x2} y1={l.y2} x2={focusX} y2={100} stroke="#f59e0b" strokeWidth={1.8} /><line x1={focusX} y1={100} x2={Math.min(retinaX, focusX + (focusX - l.x2) * 0.4)} y2={100 + (100 - l.y2) * 0.4} stroke="#f59e0b" strokeWidth={1.2} opacity={focusX < retinaX ? 0.8 : 0} /></g>)}
        <circle cx={Math.min(focusX, 390)} cy={100} r={4} fill={sharp ? '#16a34a' : '#dc2626'} />
      </svg>
      <label className="mt-3 block text-sm">Spectacle lens power <b>{P > 0 ? '+' : ''}{P} D</b><Slider value={[P]} min={-4} max={4} step={0.25} onValueChange={([v]) => setP(v)} className="mt-1" aria-label="lens power in dioptres" /></label>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Focus" value={sharp ? '✅ On the retina' : net > 0 ? 'In front of the retina' : 'Behind the retina'} />
        <Readout label="Lens type" value={P === 0 ? 'None' : P < 0 ? 'Concave (diverging)' : 'Convex (converging)'} />
        <Readout label="Focal length f = 1/P" value={P === 0 ? '—' : `${(100 / P).toFixed(0)} cm`} />
      </div>
      <p className="mt-3 rounded-xl bg-muted/60 px-4 py-2 text-sm">{pt.note}</p>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">For myopia with far point d (in m), the lens needed is P = −1/d. For hypermetropia with near point N, P = 1/0.25 − 1/N. Eye tests in India often use a Snellen chart at 6 m; “6/6 vision” is normal.</p>
    </LabFrame>
  )
}
