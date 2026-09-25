import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { iceMelted, mixTemperature } from './model'

const tempColour = (t: number) => `hsl(${Math.round(220 - (Math.min(100, Math.max(0, t)) / 100) * 220)} 85% 55%)`

function Beaker({ mass, temp, label }: { mass: number; temp: number; label: string }) {
  const h = 20 + (mass / 500) * 90
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 80 120" className="h-32" role="img" aria-label={`${label}: ${mass} g of water at ${temp.toFixed(0)} °C`}>
        <motion.rect x={10} width={60} rx={3} animate={{ y: 115 - h, height: h }} fill={tempColour(temp)} opacity={0.75} />
        <path d="M8 5 V115 H72 V5" fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={2.5} />
      </svg>
      <span className="text-xs font-semibold">{label}</span>
    </div>
  )
}

export default function HeatMixer() {
  const [tab, setTab] = useState<'mix' | 'ice'>('mix')
  const [m1, setM1] = useState(200)
  const [t1, setT1] = useState(80)
  const [m2, setM2] = useState(200)
  const [t2, setT2] = useState(20)
  const [mixed, setMixed] = useState(false)
  const [melt, setMelt] = useState(false)
  const tf = mixTemperature(m1, t1, m2, t2)

  const cup = { mass: 200, temp: 90 }
  const bucket = { mass: 10000, temp: 40 }

  return (
    <LabFrame labId="heat-mixer" title="Heat Mixer" subtitle="Temperature tells you how hot something is. Heat is energy that flows. They're not the same!" howTo={<p>Tab 1: set the amount and temperature of two beakers of water, predict the final temperature, then mix. Tab 2: which can melt more ice, a cup of very hot water or a bucket of warm water?</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['mix', '🥛 Mix hot and cold'], ['ice', '🧊 Cup vs bucket']] as const).map(([t, lbl]) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-md px-3 py-1', tab === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>

      {tab === 'mix' ? (
        <div className="grid gap-4 md:grid-cols-[1fr_260px]">
          <div className="flex items-end justify-around rounded-2xl border bg-background p-3">
            {!mixed ? (
              <>
                <Beaker mass={m1} temp={t1} label={`A: ${m1} g, ${t1} °C`} />
                <Beaker mass={m2} temp={t2} label={`B: ${m2} g, ${t2} °C`} />
              </>
            ) : (
              <Beaker mass={Math.min(500, m1 + m2)} temp={tf} label={`Mixed: ${m1 + m2} g, ${tf.toFixed(1)} °C`} />
            )}
          </div>
          <div className="space-y-3">
            {([['A', m1, setM1, t1, setT1], ['B', m2, setM2, t2, setT2]] as const).map(([n, m, setM, t, setT]) => (
              <div key={n} className="space-y-1.5 rounded-lg border p-2 text-sm">
                <label className="block">Beaker {n} water: <b>{m} g</b>
                  <Slider value={[m]} min={50} max={400} step={50} onValueChange={([v]) => { setM(v); setMixed(false) }} className="mt-1" aria-label={`Beaker ${n} mass`} />
                </label>
                <label className="block">Beaker {n} temperature: <b>{t} °C</b>
                  <Slider value={[t]} min={0} max={100} step={5} onValueChange={([v]) => { setT(v); setMixed(false) }} className="mt-1" aria-label={`Beaker ${n} temperature`} />
                </label>
              </div>
            ))}
            <Button className="w-full" onClick={() => setMixed((x) => !x)}>{mixed ? '↩ Separate again' : '🥄 Mix them!'}</Button>
            {mixed && <Readout label="Final temperature" value={`${tf.toFixed(1)} °C`} />}
          </div>
          {mixed && (
            <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">
              Heat flowed from the hotter water to the colder water until both reached the same temperature. {m1 === m2 ? 'Equal amounts end up exactly halfway.' : 'The bigger amount of water pulls the final temperature closer to its own.'} Adding 80 °C water to 20 °C water never gives 100 °C: temperatures don't add up!
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {([['☕ A cup of very hot water', cup], ['🪣 A bucket of warm water', bucket]] as const).map(([name, w]) => (
              <div key={name} className="rounded-2xl border bg-background p-4 text-center">
                <p className="font-heading font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">{w.mass >= 1000 ? `${w.mass / 1000} kg` : `${w.mass} g`} at {w.temp} °C</p>
                <div className="mt-2 flex flex-wrap justify-center gap-0.5 text-lg" aria-hidden>
                  {melt && Array.from({ length: Math.min(60, Math.round(iceMelted(w.mass, w.temp) / 100)) }, (_, i) => <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>💧</motion.span>)}
                  {melt && Math.round(iceMelted(w.mass, w.temp) / 100) === 0 && <span className="text-sm">less than one 100 g ice block</span>}
                </div>
                {melt && <p className="mt-1 text-sm">Melts about <b>{iceMelted(w.mass, w.temp) >= 1000 ? `${(iceMelted(w.mass, w.temp) / 1000).toFixed(1)} kg` : `${Math.round(iceMelted(w.mass, w.temp))} g`}</b> of ice</p>}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Predict first: which one has a higher temperature? Which one holds more heat energy?</p>
          <Button onClick={() => setMelt(true)} disabled={melt}>🧊 Pour each one over a pile of ice</Button>
          {melt && <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The cup is <b>hotter</b> (higher temperature), but the bucket holds far more <b>heat energy</b> because it has so much more water. Each 💧 is 100 g of melted ice. Temperature depends on how fast the particles jiggle; heat energy also depends on how many particles there are.</p>}
        </div>
      )}
    </LabFrame>
  )
}
