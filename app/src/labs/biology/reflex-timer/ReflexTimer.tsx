import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

const ARC = [
  { part: 'Receptor', eg: 'Pain receptors in the skin', icon: '👆' },
  { part: 'Sensory neuron', eg: 'Carries the message to the spinal cord', icon: '➡️' },
  { part: 'Relay neuron (spinal cord)', eg: 'Passes it straight on, without waiting for the brain', icon: '🔀' },
  { part: 'Motor neuron', eg: 'Carries the message to the muscle', icon: '➡️' },
  { part: 'Effector', eg: 'Arm muscle contracts: hand pulls away', icon: '💪' },
]

export default function ReflexTimer() {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'go' | 'early'>('idle')
  const [times, setTimes] = useState<number[]>([])
  const start = useRef(0)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const begin = () => {
    setPhase('waiting')
    timer.current = window.setTimeout(() => { start.current = performance.now(); setPhase('go') }, 1200 + Math.random() * 2500)
  }
  const hit = () => {
    if (phase === 'waiting') { window.clearTimeout(timer.current); setPhase('early'); return }
    if (phase === 'go') { setTimes((t) => [...t, Math.round(performance.now() - start.current)].slice(-5)); setPhase('idle') }
  }
  const avg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null
  return (
    <LabFrame labId="reflex-timer" title="Reaction Time and Reflexes" subtitle="A voluntary reaction goes through your brain. A reflex takes a short cut through the spinal cord, so it's much faster." howTo={<p>Press Start, then tap the big box the moment it turns green. Do five tries and compare your average with a reflex.</p>}>
      <button type="button" onClick={phase === 'idle' || phase === 'early' ? begin : hit} className={cn('flex h-40 w-full items-center justify-center rounded-3xl text-2xl font-bold text-white transition', phase === 'go' ? 'bg-success' : phase === 'waiting' ? 'bg-destructive' : 'bg-chem')}>
        {phase === 'idle' ? (times.length ? 'Tap to go again' : 'Tap to start') : phase === 'waiting' ? 'Wait for green…' : phase === 'go' ? 'TAP NOW!' : 'Too early! Tap to try again'}
      </button>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Readout label="Your tries (ms)" value={times.length ? times.join(', ') : '—'} />
        <Readout label="Your average" value={avg ? `${avg} ms` : '—'} />
        <Readout label="Typical knee-jerk reflex" value="≈ 50 ms" />
      </div>
      {times.length > 0 && <Button className="mt-2" variant="ghost" size="sm" onClick={() => setTimes([])}>Clear</Button>}
      <div className="mt-4 rounded-2xl border p-3">
        <p className="font-semibold">⚡ The reflex arc (touching a hot pan)</p>
        <ol className="mt-2 grid gap-2 sm:grid-cols-5">{ARC.map((a, k) => <li key={a.part} className="rounded-xl bg-muted/50 p-2 text-center text-xs"><p className="text-2xl">{a.icon}</p><p className="font-semibold">{k + 1}. {a.part}</p><p className="text-muted-foreground">{a.eg}</p></li>)}</ol>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Your reaction to the green box is <b>voluntary</b>: your eyes send signals to the brain, which decides and sends a message to your finger muscles. A <b>reflex</b> is automatic and protective: the spinal cord sends the response before the brain even knows, and the feeling of pain comes a moment later. Nerve impulses travel at up to about 100 m/s.</p>
    </LabFrame>
  )
}
