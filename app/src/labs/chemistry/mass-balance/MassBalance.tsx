import { animate, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

type Change = 'up' | 'same' | 'down'
type Exp = {
  id: string
  title: string
  emoji: string
  start: number
  end: number
  sealed: boolean
  kind: 'fizz' | 'fizz-balloon' | 'burn' | 'precipitate' | 'melt'
  why: string
}

const EXPERIMENTS: Exp[] = [
  { id: 'open', title: 'Vinegar + baking soda (open flask)', emoji: '🫧', start: 250.0, end: 248.9, sealed: false, kind: 'fizz', why: 'Carbon dioxide gas escaped into the air, so the balance lost that mass. The atoms were not destroyed. They just left the flask!' },
  { id: 'closed', title: 'Vinegar + baking soda (balloon on top)', emoji: '🎈', start: 250.0, end: 250.0, sealed: true, kind: 'fizz-balloon', why: 'The balloon trapped the carbon dioxide. Nothing got in or out, so the total mass stayed exactly the same.' },
  { id: 'burn', title: 'Burning steel wool on the balance', emoji: '🔥', start: 50.0, end: 50.8, sealed: false, kind: 'burn', why: 'Iron joined with OXYGEN from the air to make iron oxide. The extra mass is the oxygen that was added.' },
  { id: 'ppt', title: 'Mixing two solutions (a blue solid forms)', emoji: '🧪', start: 180.0, end: 180.0, sealed: false, kind: 'precipitate', why: 'A new solid formed (copper hydroxide), but no gas left and nothing was added. Mass stayed the same.' },
  { id: 'melt', title: 'Ice melting in a closed jar', emoji: '🧊', start: 120.0, end: 120.0, sealed: true, kind: 'melt', why: 'A physical change: the same water particles just changed state. Mass is always conserved.' },
]

const LABEL: Record<Change, string> = { up: 'Mass goes UP', same: 'Mass stays the SAME', down: 'Mass goes DOWN' }
const truth = (e: Exp): Change => (e.end > e.start ? 'up' : e.end < e.start ? 'down' : 'same')

export default function MassBalance() {
  const [exp, setExp] = useState(EXPERIMENTS[0])
  const [prediction, setPrediction] = useState<Change | null>(null)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [reading, setReading] = useState(exp.start)
  const [scores, setScores] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setReading(exp.start)
    setPrediction(null)
    setRunning(false)
    setDone(false)
  }, [exp])

  const run = () => {
    setRunning(true)
    const controls = animate(exp.start, exp.end, {
      duration: 3.5,
      ease: 'easeInOut',
      onUpdate: (v) => setReading(v),
      onComplete: () => {
        setRunning(false)
        setDone(true)
        const ok = prediction === truth(exp)
        setScores((s) => ({ ...s, [exp.id]: ok }))
        ;(ok ? sfx.correct : sfx.wrong)()
      },
    })
    return () => controls.stop()
  }

  const active = running || done
  return (
    <LabFrame
      labId="mass-balance"
      title="Mass Balance"
      subtitle="Does mass change during a reaction?"
      howTo={<p>Pick an experiment, predict what the balance will show, then start it. Watch whether anything can get in or out.</p>}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {EXPERIMENTS.map((e) => (
          <button key={e.id} type="button" onClick={() => setExp(e)} className={cn('rounded-full border px-3 py-1.5 text-sm', e.id === exp.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>
            {e.emoji} {e.title} {e.id in scores && (scores[e.id] ? '✅' : '❌')}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <svg viewBox="0 0 260 220" className="w-full rounded-xl border bg-background" role="img" aria-label={`${exp.title}. Balance reads ${reading.toFixed(1)} grams.`}>
          {/* balance */}
          <rect x={40} y={170} width={180} height={34} rx={6} fill="#334155" />
          <rect x={60} y={160} width={140} height={10} rx={3} fill="#94a3b8" />
          <rect x={95} y={178} width={70} height={20} rx={3} fill="#0f172a" />
          <text x={130} y={193} textAnchor="middle" fontSize={14} fontFamily="monospace" fill="#4ade80">{reading.toFixed(1)} g</text>

          {exp.kind === 'burn' ? (
            <g>
              <rect x={95} y={145} width={70} height={15} rx={2} fill="#d6d3d1" />
              <motion.ellipse cx={130} cy={137} rx={28} ry={10} animate={{ fill: done || running ? '#57534e' : '#a8a29e' }} transition={{ duration: 3 }} />
              {running && <motion.path d="M115 130 C118 110 125 120 130 100 C135 120 142 110 145 130 Z" fill="#f97316" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.4 }} />}
            </g>
          ) : exp.kind === 'melt' ? (
            <g>
              <rect x={100} y={90} width={60} height={70} rx={8} fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={2.5} />
              <rect x={98} y={84} width={64} height={8} rx={2} fill="#78716c" />
              <motion.rect x={112} width={36} rx={4} fill="#bae6fd" animate={active ? { y: 142, height: 16 } : { y: 118, height: 36 }} transition={{ duration: 3.5 }} />
            </g>
          ) : (
            <g>
              {/* conical flask */}
              <path d="M118 70 V95 L92 158 H168 L142 95 V70" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={2.5} />
              <path d="M104 128 L92 158 H168 L156 128 Z" fill={exp.kind === 'precipitate' ? (active ? '#7dd3fc' : '#bae6fd') : '#fef3c7'} opacity={0.9} />
              {exp.kind === 'precipitate' && active && Array.from({ length: 20 }, (_, i) => <motion.circle key={i} cx={100 + ((i * 29) % 60)} r={2.5} fill="#1d4ed8" initial={{ cy: 132 }} animate={{ cy: 154 - (i % 3) * 2 }} transition={{ duration: 2, delay: i * 0.05 }} />)}
              {(exp.kind === 'fizz' || exp.kind === 'fizz-balloon') && running &&
                Array.from({ length: 10 }, (_, i) => (
                  <motion.circle key={i} cx={112 + ((i * 13) % 36)} r={2.5} fill="#fff" stroke="#a8a29e" strokeWidth={0.5} animate={{ cy: [154, exp.kind === 'fizz' ? 30 : 80], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1 + (i % 3) * 0.3, delay: i * 0.1 }} />
                ))}
              {exp.kind === 'fizz-balloon' && (
                <motion.ellipse cx={130} fill="#f43f5e" opacity={0.85} animate={active ? { cy: 42, rx: 26, ry: 30 } : { cy: 64, rx: 8, ry: 8 }} transition={{ duration: 3.5 }} />
              )}
              {exp.kind === 'fizz' && running && <text x={170} y={50} fontSize={11} className="fill-muted-foreground">CO₂ escaping ↗</text>}
            </g>
          )}
          {exp.sealed && <text x={20} y={24} fontSize={11} className="fill-muted-foreground">🔒 closed system</text>}
          {!exp.sealed && <text x={20} y={24} fontSize={11} className="fill-muted-foreground">🔓 open to the air</text>}
        </svg>

        <div className="space-y-2">
          <p className="text-sm font-semibold">🔮 Predict: what will the balance show?</p>
          {(['up', 'same', 'down'] as Change[]).map((c) => (
            <Button key={c} variant={prediction === c ? 'default' : 'outline'} className="w-full justify-start" disabled={active} onClick={() => setPrediction(c)}>
              {LABEL[c]}
            </Button>
          ))}
          <Button size="lg" className="w-full" disabled={!prediction || active} onClick={run}>
            ▶ Start the experiment
          </Button>
          {done && (
            <Button variant="ghost" className="w-full" onClick={() => setExp({ ...exp })}>
              Run again
            </Button>
          )}
        </div>
      </div>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className={cn('mt-4 rounded-xl border p-4 text-sm', prediction === truth(exp) ? 'border-success/50 bg-success-soft' : 'bg-warn-soft')}>
          <p className="font-semibold">
            {prediction === truth(exp) ? '🎯 Correct!' : '🤔 Surprise!'} {exp.start.toFixed(1)} g → {exp.end.toFixed(1)} g ({LABEL[truth(exp)].toLowerCase()}).
          </p>
          <p className="mt-1">{exp.why}</p>
          <p className="mt-2 text-muted-foreground">
            <b>Law of conservation of mass:</b> in a chemical reaction, mass is never created or destroyed. If you count everything, including gases, the total mass stays the same.
          </p>
        </motion.div>
      )}
    </LabFrame>
  )
}
