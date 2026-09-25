import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'

type Obj = { id: string; name: string; emoji: string; mass: number; volume: number; size: number }

const OBJECTS: Obj[] = [
  { id: 'cork', name: 'Cork', emoji: '🟫', mass: 2.4, volume: 10, size: 26 },
  { id: 'wood', name: 'Wooden cube', emoji: '🪵', mass: 5.2, volume: 8, size: 24 },
  { id: 'bead', name: 'Plastic bead', emoji: '🔵', mass: 0.95, volume: 1, size: 16 },
  { id: 'grape', name: 'Grape', emoji: '🍇', mass: 5.4, volume: 5, size: 22 },
  { id: 'nut', name: 'Steel nut', emoji: '🔩', mass: 7.9, volume: 1, size: 18 },
]

const LAYERS = [
  { name: 'Vegetable oil', density: 0.92, top: 70, bottom: 160, color: '#facc15', opacity: 0.35 },
  { name: 'Water', density: 1.0, top: 160, bottom: 250, color: '#38bdf8', opacity: 0.35 },
  { name: 'Honey', density: 1.42, top: 250, bottom: 340, color: '#d97706', opacity: 0.55 },
]

type Outcome = 'top' | 'oil-water' | 'water-honey' | 'bottom'
const OUTCOME_LABEL: Record<Outcome, string> = {
  top: 'Floats on the oil',
  'oil-water': 'Stops between oil and water',
  'water-honey': 'Stops between water and honey',
  bottom: 'Sinks to the bottom',
}

function outcomeFor(d: number): Outcome {
  if (d < LAYERS[0].density) return 'top'
  if (d < LAYERS[1].density) return 'oil-water'
  if (d < LAYERS[2].density) return 'water-honey'
  return 'bottom'
}

function restY(d: number, size: number) {
  const o = outcomeFor(d)
  if (o === 'top') return LAYERS[0].top - size * 0.2
  if (o === 'oil-water') return LAYERS[1].top
  if (o === 'water-honey') return LAYERS[2].top
  return LAYERS[2].bottom - size / 2
}

type Dropped = { key: number; obj: Obj; x: number }

export default function DensityTower() {
  const [selected, setSelected] = useState<Obj>(OBJECTS[0])
  const [custom, setCustom] = useState({ mass: 12, volume: 10 })
  const [guess, setGuess] = useState('')
  const [checked, setChecked] = useState<'right' | 'wrong' | null>(null)
  const [prediction, setPrediction] = useState<Outcome | null>(null)
  const [dropped, setDropped] = useState<Dropped[]>([])
  const [lastResult, setLastResult] = useState<{ obj: Obj; outcome: Outcome; predicted: Outcome } | null>(null)

  const obj: Obj = selected.id === 'custom' ? { ...selected, mass: custom.mass, volume: custom.volume } : selected
  const density = obj.mass / obj.volume

  const pick = (o: Obj) => {
    setSelected(o)
    setGuess('')
    setChecked(null)
    setPrediction(null)
  }

  const check = () => {
    const g = Number(guess)
    const ok = Number.isFinite(g) && Math.abs(g - density) <= 0.02 + density * 0.02
    setChecked(ok ? 'right' : 'wrong')
    if (ok) sfx.correct()
    else sfx.wrong()
  }

  const drop = () => {
    if (!prediction) return
    const outcome = outcomeFor(density)
    setDropped((d) => [...d.filter((x) => x.obj.id !== obj.id), { key: Date.now(), obj, x: 60 + Math.random() * 120 }])
    setLastResult({ obj, outcome, predicted: prediction })
    if (outcome === prediction) sfx.correct()
    setPrediction(null)
  }

  return (
    <LabFrame
      labId="density-tower"
      title="Density Tower"
      subtitle="Calculate density, predict, then drop!"
      howTo={
        <ol className="list-decimal space-y-1 pl-5">
          <li>Pick an object and read its mass and volume.</li>
          <li>Calculate its density: <b>density = mass ÷ volume</b> (g/cm³).</li>
          <li>Predict where it will stop, then drop it into the tower.</li>
        </ol>
      }
    >
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <svg viewBox="0 0 240 360" className="mx-auto w-full max-w-[260px]" role="img" aria-label="Density tower with layers of oil, water and honey">
          {LAYERS.map((l) => (
            <g key={l.name}>
              <rect x={30} y={l.top} width={180} height={l.bottom - l.top} fill={l.color} opacity={l.opacity} />
              <text x={206} y={l.top + 16} textAnchor="end" fontSize={11} className="fill-foreground">
                {l.name} · {l.density.toFixed(2)}
              </text>
            </g>
          ))}
          <path d="M30 20 V340 H210 V20" fill="none" stroke="currentColor" strokeOpacity={0.4} strokeWidth={3} />
          {dropped.map((d) => {
            const dens = d.obj.mass / d.obj.volume
            return (
              <motion.text
                key={d.key}
                x={d.x}
                fontSize={d.obj.size}
                textAnchor="middle"
                dominantBaseline="middle"
                initial={{ y: 0 }}
                animate={{ y: restY(dens, d.obj.size) }}
                transition={{ type: 'spring', stiffness: 40, damping: 12, mass: 1.2 }}
              >
                {d.obj.emoji}
              </motion.text>
            )
          })}
        </svg>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {[...OBJECTS, { id: 'custom', name: 'Design your own', emoji: '🧪', mass: custom.mass, volume: custom.volume, size: 20 }].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pick(o)}
                className={cn('rounded-full border px-3 py-1.5 text-sm', selected.id === o.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}
              >
                {o.emoji} {o.name}
              </button>
            ))}
          </div>

          {selected.id === 'custom' ? (
            <div className="space-y-3 rounded-xl border p-3">
              <label className="block text-sm">
                Mass: <b>{custom.mass} g</b>
                <Slider value={[custom.mass]} min={1} max={30} step={0.5} onValueChange={([v]) => { setCustom((c) => ({ ...c, mass: v })); setChecked(null) }} className="mt-2" aria-label="Mass" />
              </label>
              <label className="block text-sm">
                Volume: <b>{custom.volume} cm³</b>
                <Slider value={[custom.volume]} min={1} max={30} step={0.5} onValueChange={([v]) => { setCustom((c) => ({ ...c, volume: v })); setChecked(null) }} className="mt-2" aria-label="Volume" />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Readout label="Mass" value={`${obj.mass} g`} />
              <Readout label="Volume" value={`${obj.volume} cm³`} />
            </div>
          )}

          <div className="rounded-xl border p-3">
            <p className="text-sm font-semibold">Step 1: Calculate the density</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                inputMode="decimal"
                value={guess}
                onChange={(e) => {
                  setGuess(e.target.value)
                  setChecked(null)
                }}
                placeholder="e.g. 0.5"
                className="h-9 w-28 rounded-lg border bg-background px-3 text-sm"
                aria-label="Your density answer in grams per cubic centimetre"
              />
              <span className="text-sm text-muted-foreground">g/cm³</span>
              <Button variant="outline" onClick={check} disabled={!guess}>
                Check
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setGuess(density.toFixed(2)); setChecked('right') }}>
                Show me
              </Button>
            </div>
            {checked === 'right' && <p className="mt-2 text-sm text-success">✅ {obj.mass} ÷ {obj.volume} = {density.toFixed(2)} g/cm³</p>}
            {checked === 'wrong' && <p className="mt-2 text-sm text-destructive">Not quite. Divide the mass by the volume: {obj.mass} ÷ {obj.volume} = ?</p>}
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-sm font-semibold">Step 2: Predict where it will stop</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {(Object.keys(OUTCOME_LABEL) as Outcome[]).map((o) => (
                <Button key={o} variant={prediction === o ? 'default' : 'outline'} onClick={() => setPrediction(o)} className="justify-start">
                  {OUTCOME_LABEL[o]}
                </Button>
              ))}
            </div>
            <Button className="mt-3" size="lg" onClick={drop} disabled={!prediction}>
              Drop the {obj.name.toLowerCase()}!
            </Button>
          </div>

          {lastResult && (
            <div role="status" className="rounded-xl border bg-chem-soft px-4 py-3 text-sm">
              <p className="font-semibold">
                {lastResult.outcome === lastResult.predicted ? '🎯 Great prediction!' : '🤔 Surprise!'} The {lastResult.obj.name.toLowerCase()}{' '}
                {OUTCOME_LABEL[lastResult.outcome].toLowerCase()}.
              </p>
              <p className="mt-1 text-muted-foreground">
                Density {(lastResult.obj.mass / lastResult.obj.volume).toFixed(2)} g/cm³. An object sinks through any liquid that is{' '}
                <b>less dense</b> than it, and floats on any liquid that is <b>more dense</b>.
              </p>
            </div>
          )}
        </div>
      </div>
    </LabFrame>
  )
}
