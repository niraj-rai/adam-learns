import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Part = { id: string; name: string; zone: 'Outer ear' | 'Middle ear' | 'Inner ear' | 'Brain'; what: string }

const STEPS: Part[] = [
  { id: 'pinna', name: 'Pinna (ear flap)', zone: 'Outer ear', what: 'Collects sound waves from the air and funnels them into the ear canal.' },
  { id: 'canal', name: 'Ear canal', zone: 'Outer ear', what: 'A 2.5 cm tube that carries the compressions and rarefactions to the eardrum. Wax and hairs trap dust.' },
  { id: 'drum', name: 'Eardrum', zone: 'Middle ear', what: 'A thin, tight membrane. Compressions push it in, rarefactions let it move out: it vibrates at the same frequency as the sound.' },
  { id: 'ossicles', name: 'Hammer, anvil and stirrup', zone: 'Middle ear', what: 'The three smallest bones in your body. They act as levers and amplify the vibrations many times.' },
  { id: 'cochlea', name: 'Cochlea', zone: 'Inner ear', what: 'A snail-shaped tube filled with liquid and lined with thousands of tiny hair cells. Different places respond to different pitches, turning vibrations into electrical signals.' },
  { id: 'nerve', name: 'Auditory nerve', zone: 'Brain', what: 'Carries the electrical signals to the brain, which interprets them as sound: a voice, music or a bell.' },
]

export default function EarJourney() {
  const [i, setI] = useState(0)
  const step = STEPS[i]
  const on = (id: string) => (step.id === id ? 1 : 0.35)
  const hi = (id: string) => (step.id === id ? '#6366f1' : 'currentColor')
  return (
    <LabFrame labId="ear-journey" title="Journey Through the Ear" subtitle="How a vibration in the air becomes a sound in your brain." howTo={<p>Step through the ear, part by part, or tap a part of the diagram.</p>}>
      <svg viewBox="0 0 560 220" className="w-full rounded-2xl border bg-background" role="img" aria-label={`The human ear: ${step.name} highlighted`}>
        {[0, 1, 2].map((k) => <path key={k} d={`M${10 + k * 16},${80 + k * 4} q10,30 0,60`} fill="none" stroke="#6366f1" strokeWidth={2} opacity={i === 0 ? 0.8 : 0.3} />)}
        <g opacity={on('pinna')} onClick={() => setI(0)} className="cursor-pointer">
          <path d="M70,40 C130,20 150,90 120,110 C150,140 120,200 70,190 C90,150 85,70 70,40 Z" fill="#f0c090" stroke={hi('pinna')} strokeWidth={3} />
        </g>
        <g opacity={on('canal')} onClick={() => setI(1)} className="cursor-pointer">
          <rect x={120} y={100} width={120} height={26} rx={10} fill="#fde2c4" stroke={hi('canal')} strokeWidth={3} />
        </g>
        <g opacity={on('drum')} onClick={() => setI(2)} className="cursor-pointer">
          <path d="M240,88 q8,25 0,50" fill="none" stroke={step.id === 'drum' ? '#6366f1' : '#b45309'} strokeWidth={5} />
        </g>
        <g opacity={on('ossicles')} onClick={() => setI(3)} className="cursor-pointer" fill="#e5e7eb" stroke={hi('ossicles')} strokeWidth={2}>
          <path d="M246,110 l18,-14 l6,6 l-18,14 z" />
          <path d="M270,96 l16,6 l-4,12 l-14,-4 z" />
          <path d="M284,112 l16,2 l0,14 l-16,-2 z" />
        </g>
        <g opacity={on('cochlea')} onClick={() => setI(4)} className="cursor-pointer">
          <path d="M340,112 m-34,0 a34,34 0 1,1 68,0 a26,26 0 1,1 -52,0 a18,18 0 1,1 36,0 a10,10 0 1,1 -20,0" fill="#fbcfe8" stroke={hi('cochlea')} strokeWidth={3} />
          <line x1={300} y1={121} x2={306} y2={121} stroke={hi('cochlea')} strokeWidth={3} />
        </g>
        <g opacity={on('nerve')} onClick={() => setI(5)} className="cursor-pointer">
          <path d="M374,100 C420,80 440,70 480,60" fill="none" stroke={step.id === 'nerve' ? '#6366f1' : '#eab308'} strokeWidth={5} />
          <text x={500} y={66} fontSize={30}>🧠</text>
        </g>
        {['Outer ear', 'Middle ear', 'Inner ear'].map((z, k) => <text key={z} x={[100, 270, 340][k]} y={210} textAnchor="middle" fontSize={11} fill="currentColor" fontWeight={step.zone === z ? 700 : 400} opacity={step.zone === z ? 1 : 0.5}>{z}</text>)}
      </svg>
      <div className="mt-3 flex flex-wrap gap-1">
        {STEPS.map((s, k) => <button key={s.id} type="button" aria-pressed={i === k} onClick={() => setI(k)} className={cn('rounded-lg border-2 px-2.5 py-1 text-sm', i === k ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{k + 1}. {s.name.split(' (')[0]}</button>)}
      </div>
      <div className="mt-3 rounded-2xl border p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase">{step.zone} · step {i + 1} of {STEPS.length}</p>
        <p className="mt-1 font-heading text-xl font-semibold">{step.name}</p>
        <p className="mt-1">{step.what}</p>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" disabled={i === 0} onClick={() => setI(i - 1)}>← Back</Button>
          <Button disabled={i === STEPS.length - 1} onClick={() => setI(i + 1)}>Next →</Button>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">🛡️ Loud sounds (above about 85 dB for long periods: earphones at full volume, firecrackers, loudspeakers) can permanently damage the hair cells in the cochlea. They don't grow back, so turn the volume down and take listening breaks.</p>
    </LabFrame>
  )
}
