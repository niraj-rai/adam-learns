import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { PROPS, SAMPLES, type Kind } from './model'

const KINDS: Kind[] = ['solution', 'colloid', 'suspension']

export default function TyndallTorch() {
  const [sid, setSid] = useState('milk')
  const [torch, setTorch] = useState(true)
  const [minutes, setMinutes] = useState(0)
  const [filtered, setFiltered] = useState(false)
  const [guesses, setGuesses] = useState<Record<string, Kind>>({})
  const s = SAMPLES.find((x) => x.id === sid)!
  const p = PROPS[s.kind]
  const settled = p.settles ? Math.min(1, minutes / 30) : 0
  const dots = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: 160 + ((i * 53) % 150), y: 60 + ((i * 37) % 120) })), [])
  const pick = (id: string) => { setSid(id); setMinutes(0); setFiltered(false) }
  const guess = (k: Kind) => {
    setGuesses((g) => ({ ...g, [sid]: k }))
    if (k === s.kind) sfx.correct()
    else sfx.wrong()
  }
  const score = SAMPLES.filter((x) => guesses[x.id] === x.kind).length
  const cloudy = s.kind === 'solution' ? 0 : s.kind === 'colloid' ? 0.35 : 0.8 * (1 - settled)
  return (
    <LabFrame labId="tyndall-torch" title="Tyndall Torch" subtitle="Solution, colloid or suspension? Shine a torch, wait, and filter to find out." howTo={<p>Choose a beaker. Shine the torch through it (look for a visible beam), leave it to stand, and pour it through filter paper. Then classify it.</p>}>
      <div className="flex flex-wrap gap-1">
        {SAMPLES.map((x) => <button key={x.id} type="button" aria-pressed={sid === x.id} onClick={() => pick(x.id)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', sid === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}{guesses[x.id] && (guesses[x.id] === x.kind ? ' ✅' : ' ❌')}</button>)}
      </div>
      <svg viewBox="0 0 480 220" className="mt-3 w-full rounded-2xl border bg-slate-900" role="img" aria-label={`${s.name}: ${torch && p.beam ? 'beam visible' : 'no beam visible'}`}>
        {torch && <>
          <rect x={20} y={100} width={50} height={26} rx={6} fill="#facc15" />
          <path d="M70,100 L150,95 L150,131 L70,126 Z" fill="#fde68a" opacity={0.35} />
          <path d={`M150,95 L${p.beam ? 330 : 150},${p.beam ? 90 : 95} L${p.beam ? 330 : 150},${p.beam ? 136 : 131} L150,131 Z`} fill="#fef9c3" opacity={p.beam ? 0.55 * (s.kind === 'suspension' ? 1 - settled * 0.7 : 1) : 0} />
          <path d="M330,95 L470,90 L470,136 L330,131 Z" fill="#fde68a" opacity={s.kind === 'suspension' ? 0.1 + settled * 0.25 : 0.3} />
        </>}
        <rect x={150} y={40} width={180} height={160} rx={8} fill={s.colour} opacity={0.35 + cloudy * 0.5} stroke="#cbd5e1" strokeWidth={3} />
        {s.kind !== 'solution' && dots.map((d, i) => <circle key={i} cx={d.x} cy={s.kind === 'suspension' ? d.y + (190 - d.y) * settled : d.y} r={s.kind === 'suspension' ? 2.6 : 1.2} fill={s.kind === 'suspension' ? '#78350f' : '#ffffff'} opacity={0.8} />)}
        {s.kind === 'suspension' && settled > 0.2 && <rect x={153} y={190 - 12 * settled} width={174} height={12 * settled + 7} fill={s.colour === '#e5e7eb' ? '#9ca3af' : '#78350f'} opacity={0.9} />}
        <text x={240} y={214} textAnchor="middle" fontSize={11} fill="#e2e8f0">{s.emoji} {s.name}</text>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-2">
          <Button variant={torch ? 'default' : 'outline'} onClick={() => setTorch((t) => !t)}>🔦 Torch {torch ? 'on' : 'off'}</Button>
          <Button variant="outline" onClick={() => setFiltered(true)}>🧻 Filter it</Button>
        </div>
        <label className="text-sm">Leave to stand: <b>{minutes} min</b><Slider value={[minutes]} min={0} max={30} step={1} onValueChange={([v]) => setMinutes(v)} className="mt-1" aria-label="minutes standing" /></label>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-4">
        <Readout label="Particle size" value={<span className="text-base">{p.size}</span>} />
        <Readout label="Beam visible?" value={torch ? (p.beam ? 'Yes' : 'No') : '—'} />
        <Readout label="Settles on standing?" value={minutes >= 10 ? (p.settles ? 'Yes' : 'No') : 'Wait…'} />
        <Readout label="Residue on filter paper?" value={filtered ? (p.filter ? 'Yes' : 'No: all passes through') : '—'} />
      </div>
      <div className="mt-3 rounded-2xl border p-3">
        <p className="text-sm font-semibold">Your verdict for {s.name}:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {KINDS.map((k) => <Button key={k} variant={guesses[sid] === k ? 'default' : 'outline'} onClick={() => guess(k)} className="capitalize">{k}</Button>)}
        </div>
        {guesses[sid] && <p className="mt-2 text-sm">{guesses[sid] === s.kind ? `✅ Right: it's a ${s.kind}. ${s.note}` : `❌ Not quite. Check the torch beam, what happens on standing, and the filter paper again.`}</p>}
        <p className="mt-1 text-xs text-muted-foreground">Classified correctly: {score} / {SAMPLES.length}</p>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">The scattering of a beam of light by particles is called the <b>Tyndall effect</b>. You see it when sunlight streams through a dusty room or a forest canopy. Solutions don't show it; colloids and suspensions do. Only a suspension settles and leaves a residue when filtered.</p>
    </LabFrame>
  )
}
