import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { cToF, cToK, inRange, type Thermometer, THERMOMETERS } from './model'

const THINGS = [
  { id: 'body', name: 'Your body (under the tongue)', emoji: '👅', temp: 37 },
  { id: 'fever', name: 'A friend with fever', emoji: '🤒', temp: 38.6 },
  { id: 'ice', name: 'Melting ice', emoji: '🧊', temp: 0 },
  { id: 'tap', name: 'Tap water in Bengaluru', emoji: '🚰', temp: 24 },
  { id: 'chai', name: 'A cup of chai', emoji: '☕', temp: 70 },
  { id: 'boil', name: 'Boiling water', emoji: '♨️', temp: 100 },
]

/** Vertical liquid-in-glass thermometer. */
function Tube({ t, reading }: { t: Thermometer; reading: number | null }) {
  const H = 220
  const y = (v: number) => 20 + (1 - (v - t.min) / (t.max - t.min)) * H
  const major = t.id === 'clinical' ? 1 : 10
  const minor = t.id === 'clinical' ? 0.1 : 2
  const ticks: number[] = []
  for (let v = t.min; v <= t.max + 1e-9; v = Math.round((v + minor) * 10) / 10) ticks.push(v)
  const level = reading === null ? t.min : Math.max(t.min, Math.min(t.max, reading))
  return (
    <svg viewBox="0 0 120 280" className="h-72" role="img" aria-label={`${t.name} scale from ${t.min} to ${t.max} °C`}>
      <rect x={45} y={12} width={16} height={H + 20} rx={8} fill="none" stroke="currentColor" strokeOpacity={0.4} />
      <circle cx={53} cy={H + 38} r={12} fill={t.id === 'clinical' ? '#94a3b8' : '#ef4444'} />
      <motion.rect x={49} width={8} animate={{ y: y(level), height: H + 30 - y(level) }} fill={t.id === 'clinical' ? '#94a3b8' : '#ef4444'} />
      {t.id === 'clinical' && <rect x={48} y={H + 20} width={10} height={4} fill="currentColor" opacity={0.6}><title>The kink stops the mercury falling back</title></rect>}
      {ticks.map((v) => {
        const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-6
        return (
          <g key={v}>
            <line x1={62} x2={isMajor ? 76 : 69} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={isMajor ? 0.8 : 0.4} strokeWidth={isMajor ? 1.2 : 0.6} />
            {isMajor && <text x={80} y={y(v) + 3} fontSize={10} className="fill-foreground">{v}</text>}
          </g>
        )
      })}
      <text x={80} y={12} fontSize={10} className="fill-muted-foreground">°C</text>
    </svg>
  )
}

export default function ThermometerLab() {
  const [tab, setTab] = useState<'measure' | 'read' | 'convert'>('measure')
  const [tid, setTid] = useState<Thermometer['id']>('lab')
  const [thing, setThing] = useState<string | null>(null)
  const [broken, setBroken] = useState(false)
  const [round, setRound] = useState(0)
  const [guess, setGuess] = useState('')
  const [checked, setChecked] = useState<null | boolean>(null)
  const [score, setScore] = useState(0)
  const [c, setC] = useState(37)

  const t = THERMOMETERS.find((x) => x.id === tid)!
  const obj = THINGS.find((x) => x.id === thing)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const target = useMemo(() => Math.round(Math.random() * 50) * 2, [round])

  const measure = (id: string) => {
    const o = THINGS.find((x) => x.id === id)!
    setThing(id)
    if (t.id !== 'lab' && o.temp > t.max) { setBroken(true); sfx.wrong() } else setBroken(false)
  }
  const check = () => {
    const ok = Math.abs(Number(guess) - target) <= 0.5
    setChecked(ok)
    if (ok) { setScore((s) => s + 1); sfx.correct() } else sfx.wrong()
  }

  const shown = obj && !broken ? (t.id === 'digital' && !inRange(t, obj.temp) ? null : obj.temp) : null

  return (
    <LabFrame labId="thermometer-lab" title="Thermometer Lab" subtitle="Choose the right thermometer, read it like a scientist, and switch between °C, °F and K." howTo={<p>Tab 1: pick a thermometer and measure different things. Careful: not every thermometer suits every job! Tab 2: read the laboratory thermometer. Tab 3: convert between temperature scales.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['measure', '🌡️ Measure'], ['read', '👀 Read the scale'], ['convert', '🔁 °C · °F · K']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>

      {tab === 'measure' && (
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="grid place-items-center rounded-2xl border bg-background">
            {t.id === 'digital' ? (
              <div className="rounded-xl bg-slate-800 px-4 py-6 font-mono text-2xl text-lime-300" aria-live="polite">{shown === null ? (obj ? 'Lo/Hi' : '--.-') : `${shown.toFixed(1)}°C`}</div>
            ) : broken ? (
              <p className="p-4 text-center text-sm">💥 <b>Cracked!</b></p>
            ) : (
              <Tube t={t} reading={shown} />
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {THERMOMETERS.map((x) => (
                <button key={x.id} type="button" onClick={() => { setTid(x.id); setThing(null); setBroken(false) }} className={cn('rounded-full border px-3 py-1.5 text-sm', x.id === tid ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.name}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Range: {t.min} °C to {t.max} °C</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {THINGS.map((x) => (
                <button key={x.id} type="button" onClick={() => measure(x.id)} className={cn('rounded-xl border px-3 py-2 text-left text-sm', thing === x.id ? 'border-chem bg-chem-soft' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>
              ))}
            </div>
            {obj && (
              <p role="status" className={cn('rounded-lg px-3 py-2 text-sm', broken ? 'bg-warn-soft' : 'bg-chem-soft')}>
                {broken
                  ? `A ${t.name.toLowerCase()} only goes up to ${t.max} °C. The liquid expands too much at ${obj.temp} °C and the glass can crack. Use a laboratory thermometer!`
                  : shown === null
                    ? `${obj.temp} °C is outside this thermometer's range, so it can't give a reading. A laboratory thermometer would work.`
                    : t.id === 'clinical' && obj.temp < t.min
                      ? `The reading stays at the bottom: ${obj.temp} °C is below this thermometer's range (${t.min} °C).`
                      : `Reading: ${obj.temp} °C. ${t.id === 'clinical' ? 'The kink keeps the reading in place after you take it out of the mouth. Shake it down before using it again.' : ''}`}
              </p>
            )}
          </div>
        </div>
      )}

      {tab === 'read' && (
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div className="grid place-items-center rounded-2xl border bg-background"><Tube t={THERMOMETERS[1]} reading={target} /></div>
          <div className="space-y-3">
            <p className="text-sm">Read the laboratory thermometer. Each small division is <b>2 °C</b>. Keep your eye level with the top of the liquid.</p>
            <div className="flex gap-2">
              <input type="number" inputMode="decimal" value={guess} onChange={(e) => { setGuess(e.target.value); setChecked(null) }} className="w-28 rounded-md border bg-background px-3 py-1.5 text-sm" aria-label="Your reading in °C" placeholder="°C" />
              <Button onClick={check} disabled={guess === ''}>Check</Button>
              <Button variant="outline" onClick={() => { setRound((r) => r + 1); setGuess(''); setChecked(null) }}>New reading</Button>
            </div>
            {checked !== null && <p role="status" className={cn('rounded-lg px-3 py-2 text-sm', checked ? 'bg-success-soft' : 'bg-warn-soft')}>{checked ? `✅ Correct: ${target} °C.` : `Not quite. It reads ${target} °C. Count the small divisions from the nearest numbered mark.`}</p>}
            <Readout label="Correct readings" value={score} />
          </div>
        </div>
      )}

      {tab === 'convert' && (
        <div className="space-y-4">
          <label className="block text-sm">Temperature: <b>{c} °C</b>
            <Slider value={[c]} min={-40} max={120} step={1} onValueChange={([v]) => setC(v)} className="mt-1.5" aria-label="Temperature in degrees Celsius" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <Readout label="Celsius" value={`${c} °C`} />
            <Readout label="Fahrenheit" value={`${cToF(c).toFixed(1)} °F`} />
            <Readout label="Kelvin" value={`${cToK(c)} K`} />
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            {[[-40, 'Where °C and °F meet'], [0, 'Ice melts'], [37, 'Body temperature'], [100, 'Water boils']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setC(v as number)} className="rounded-full border px-3 py-1 hover:bg-muted">{l} ({v} °C)</button>
            ))}
          </div>
          <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">°F = °C × 9 ⁄ 5 + 32 &nbsp;·&nbsp; K = °C + 273. Doctors in India often use °F for fever: 98.6 °F is normal body temperature (37 °C). Scientists use the kelvin, the SI unit.</p>
        </div>
      )}
    </LabFrame>
  )
}
