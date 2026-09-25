import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { ATOMS, P, SAMPLES, layout, type Atom, type Sample } from './samples'

export type ParticleZoomProps = {
  /** 'pure' asks pure substance vs mixture; 'ecm' asks element / compound / mixture */
  ask?: 'pure' | 'ecm'
}

const W = 300
const H = 210

const ZOOM_LABELS = ['1×', '100×', '10,000×', '1,000,000×', '100,000,000×']

function ParticlePicture({ sample }: { sample: Sample }) {
  const placed = useMemo(() => layout(sample, W, H), [sample])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`Particle picture of ${sample.name}`}>
      <rect width={W} height={H} rx={12} className="fill-muted/60" />
      {placed.map((pl, i) => (
        <g key={i} transform={`translate(${pl.x} ${pl.y}) rotate(${pl.rot})`}>
          {P[pl.p].atoms.map((a, k) => (
            <circle key={k} cx={a.dx} cy={a.dy} r={ATOMS[a.a].r} fill={ATOMS[a.a].fill} stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
          ))}
        </g>
      ))}
    </svg>
  )
}

export default function ParticleZoom({ ask = 'ecm' }: ParticleZoomProps) {
  const [sampleId, setSampleId] = useState(SAMPLES[0].id)
  const [zoom, setZoom] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const sample = SAMPLES.find((s) => s.id === sampleId)!

  const level = Math.min(4, Math.floor(zoom / 25))
  const particleView = zoom >= 75
  const microscopeView = zoom >= 35 && !particleView

  const options = ask === 'pure' ? ['Pure substance', 'Mixture'] : ['Element', 'Compound', 'Mixture']
  const correct = ask === 'pure' ? (sample.kind === 'mixture' ? 'Mixture' : 'Pure substance') : sample.kind[0].toUpperCase() + sample.kind.slice(1)
  const answered = answers[sample.id]
  const score = SAMPLES.filter((s) => {
    const c = ask === 'pure' ? (s.kind === 'mixture' ? 'Mixture' : 'Pure substance') : s.kind[0].toUpperCase() + s.kind.slice(1)
    return answers[s.id] === c
  }).length

  const legend = useMemo(() => {
    const names = new Map<string, { fill: string; atoms: Atom[] }>()
    for (const m of sample.mix) names.set(P[m.p].name, { fill: ATOMS[P[m.p].atoms[0].a].fill, atoms: P[m.p].atoms.map((a) => a.a) })
    return [...names.entries()]
  }, [sample])

  return (
    <LabFrame
      labId="particle-zoom"
      title="Particle Zoom"
      subtitle="Zoom in until you can see the particles, then decide what it is"
      howTo={
        <ul className="list-disc space-y-1 pl-5">
          <li>Pick a sample, then drag the zoom slider all the way to the right.</li>
          <li>Look at the particles: are they all the same? Are different atoms joined together, or just mixed?</li>
          <li>Classify each sample. Can you get all {SAMPLES.length} right?</li>
        </ul>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSampleId(s.id)
              setZoom(0)
            }}
            className={cn('rounded-full border px-3 py-1.5 text-sm', s.id === sample.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
          >
            {s.emoji} {s.name}
            {answers[s.id] && <span className="ml-1">{answers[s.id] === (ask === 'pure' ? (s.kind === 'mixture' ? 'Mixture' : 'Pure substance') : s.kind[0].toUpperCase() + s.kind.slice(1)) ? '✅' : '❌'}</span>}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div>
          <div className="relative aspect-[300/210] overflow-hidden rounded-xl border bg-background">
            {particleView ? (
              <motion.div key={`p-${sample.id}`} initial={{ opacity: 0, scale: 1.4 }} animate={{ opacity: 1, scale: 1 }} className="h-full w-full">
                <ParticlePicture sample={sample} />
              </motion.div>
            ) : (
              <div className="grid h-full w-full place-items-center">
                <motion.span
                  animate={{ scale: 1 + zoom / 12, filter: microscopeView ? 'blur(2px)' : 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="text-7xl select-none"
                  aria-hidden
                >
                  {sample.emoji}
                </motion.span>
                {microscopeView && (
                  <p className="absolute inset-x-3 bottom-3 rounded-lg bg-background/85 px-3 py-2 text-center text-sm">🔬 Under a microscope: {sample.microscope} Keep zooming!</p>
                )}
              </div>
            )}
            <span className="absolute top-2 left-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold tabular-nums">🔍 {ZOOM_LABELS[level]}</span>
          </div>
          <div className="mt-3">
            <Slider value={[zoom]} min={0} max={100} step={1} onValueChange={([v]) => setZoom(v)} aria-label="Zoom" className="[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-2" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>What you see</span>
              <span>Microscope</span>
              <span>Particles</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {particleView && (
            <div className="rounded-xl border bg-background p-3 text-sm">
              <p className="mb-2 font-semibold">Key</p>
              <ul className="space-y-1.5">
                {legend.map(([name, v]) => (
                  <li key={name} className="flex items-center gap-2">
                    <span className="flex -space-x-1">
                      {v.atoms.map((a, i) => (
                        <span key={i} className="inline-block size-3.5 rounded-full border border-black/30" style={{ background: ATOMS[a].fill }} />
                      ))}
                    </span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border bg-chem-soft p-3">
            <p className="text-sm font-semibold">What is {sample.name.toLowerCase()}?</p>
            {!particleView && !answered && <p className="mt-1 text-xs text-muted-foreground">Tip: zoom all the way in before deciding.</p>}
            <div className="mt-2 grid gap-2">
              {options.map((o) => (
                <Button
                  key={o}
                  variant={answered === o ? (o === correct ? 'default' : 'destructive') : 'outline'}
                  disabled={Boolean(answered)}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [sample.id]: o }))
                    ;(o === correct ? sfx.correct : sfx.wrong)()
                    setZoom(100)
                  }}
                  className="justify-start"
                >
                  {o}
                </Button>
              ))}
            </div>
            {answered && (
              <p role="status" className="mt-2 text-sm">
                <b>{answered === correct ? '✅ Correct!' : `❌ It's ${ask === 'pure' ? correct.toLowerCase() : `a ${correct.toLowerCase()}`}.`}</b> {sample.explain}
              </p>
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Score: <b className="text-foreground">{score}</b> / {SAMPLES.length}
          </p>
        </div>
      </div>
    </LabFrame>
  )
}

