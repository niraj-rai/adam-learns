import { motion } from 'motion/react'
import { useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { shuffle } from '@/lib/grading'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

/** Top of the column is coolest; fractions condense where the column is at their boiling range. */
const FRACTIONS = [
  { id: 'lpg', name: 'Petroleum gas (LPG)', temp: 'below 40 °C', use: 'Cooking gas cylinders, autos', color: '#e0f2fe' },
  { id: 'petrol', name: 'Petrol', temp: '40–110 °C', use: 'Fuel for cars and scooters', color: '#fef9c3' },
  { id: 'kerosene', name: 'Kerosene', temp: '150–250 °C', use: 'Jet fuel, stoves, lamps', color: '#fde68a' },
  { id: 'diesel', name: 'Diesel', temp: '250–350 °C', use: 'Buses, trucks, trains, generators', color: '#fdba74' },
  { id: 'lubricating', name: 'Lubricating oil & paraffin wax', temp: '350–400 °C', use: 'Engine oil, candles, Vaseline', color: '#c2410c' },
  { id: 'bitumen', name: 'Bitumen', temp: 'above 400 °C', use: 'Tar for making roads', color: '#1c1917' },
]

/** Calorific values in kJ/g (typical textbook figures). */
const CALORIFIC = [
  { fuel: 'Cow dung cake', v: 7 },
  { fuel: 'Wood', v: 18 },
  { fuel: 'Coal', v: 28 },
  { fuel: 'Petrol', v: 45 },
  { fuel: 'Kerosene', v: 45 },
  { fuel: 'Diesel', v: 45 },
  { fuel: 'CNG / methane', v: 50 },
  { fuel: 'LPG', v: 55 },
  { fuel: 'Hydrogen', v: 150 },
]

export default function RefineryTower() {
  const [placed, setPlaced] = useState<Record<number, string>>({})
  const [picked, setPicked] = useState<string | null>(null)
  const [tray] = useState(() => shuffle(FRACTIONS.map((f) => f.id)))
  const [checked, setChecked] = useState(false)

  const allPlaced = Object.keys(placed).length === FRACTIONS.length
  const correct = FRACTIONS.every((f, i) => placed[i] === f.id)

  const place = (level: number) => {
    if (!picked || checked) return
    const next = { ...placed }
    for (const [k, v] of Object.entries(next)) if (v === picked) delete next[Number(k)]
    next[level] = picked
    setPlaced(next)
    setPicked(null)
  }

  return (
    <LabFrame
      labId="refinery-tower"
      title="Refinery Tower"
      subtitle="Crude oil is separated by fractional distillation. Where does each fraction come out?"
      howTo={<p>Hot crude oil vapour enters at the bottom. The column is hottest at the bottom and coolest at the top. Each fraction condenses where the temperature matches its boiling range. Tap a fraction, then tap its level.</p>}
    >
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <div className="flex gap-2">
          <div className="flex w-6 flex-col items-center justify-between py-2 text-[10px] font-semibold text-muted-foreground">
            <span>❄️ cool</span>
            <div className="w-1.5 flex-1 rounded-full bg-gradient-to-b from-sky-300 to-red-500" />
            <span>🔥 hot</span>
          </div>
          <div className="flex-1 space-y-1.5 rounded-2xl border-4 border-slate-400 bg-slate-100 p-2 dark:bg-slate-900">
            {FRACTIONS.map((f, i) => {
              const here = placed[i] ? FRACTIONS.find((x) => x.id === placed[i])! : null
              const ok = checked && placed[i] === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => place(i)}
                  className={cn('flex h-11 w-full items-center justify-between rounded-lg border-2 border-dashed px-2 text-left text-xs', here ? 'border-solid' : '', picked && 'hover:border-primary', checked && (ok ? 'border-success' : 'border-destructive'))}
                  style={{ background: here ? here.color : undefined, color: here && (here.id === 'bitumen' || here.id === 'lubricating') ? '#fff' : undefined }}
                  aria-label={`Level ${i + 1} from the top, ${f.temp}${here ? `: ${here.name}` : ''}`}
                >
                  <span className="font-semibold">{here ? here.name : '…'}</span>
                  <span className="opacity-70">{f.temp}</span>
                </button>
              )
            })}
            <p className="pt-1 text-center text-xs text-muted-foreground">⬆️ hot crude oil vapour enters here</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold">Fractions to place</p>
          <div className="flex flex-wrap gap-2">
            {tray.map((id) => {
              const f = FRACTIONS.find((x) => x.id === id)!
              const used = Object.values(placed).includes(id)
              return (
                <button key={id} type="button" disabled={checked} onClick={() => setPicked(picked === id ? null : id)} className={cn('rounded-full border-2 px-3 py-1.5 text-sm', picked === id && 'border-primary bg-primary/10', used && 'opacity-40')}>
                  {f.name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <Button
              disabled={!allPlaced || checked}
              onClick={() => {
                setChecked(true)
                ;(correct ? sfx.win : sfx.wrong)()
              }}
            >
              Check my tower
            </Button>
            <Button variant="ghost" onClick={() => { setPlaced({}); setChecked(false); setPicked(null) }}>
              Reset
            </Button>
          </div>
          {checked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="status" className={cn('rounded-xl p-3 text-sm', correct ? 'bg-success-soft' : 'bg-warn-soft')}>
              <p className="font-semibold">{correct ? '🎉 Perfect refinery!' : 'Some fractions are in the wrong place (red). Small molecules with LOW boiling points rise to the top.'}</p>
              <ul className="mt-2 space-y-0.5">
                {FRACTIONS.map((f) => (
                  <li key={f.id}>
                    <b>{f.name}</b>: {f.use}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="rounded-xl border bg-background p-3">
            <p className="text-sm font-semibold">Which fuel gives the most energy? (calorific value, kJ per gram)</p>
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CALORIFIC} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="fuel" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [`${v} kJ/g`, 'Calorific value']} />
                  <Bar dataKey="v" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                    {CALORIFIC.map((c) => (
                      <Cell key={c.fuel} fill={c.fuel === 'Hydrogen' ? '#0ea5e9' : 'var(--chem)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground">Hydrogen has the highest calorific value and burns to give only water, but it is hard to store safely.</p>
          </div>
        </div>
      </div>
    </LabFrame>
  )
}
