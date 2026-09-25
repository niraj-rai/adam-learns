import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'
import { germinationDay, type Pot, seedlingColour, seedlingHeight, type Temp, type Water } from './model'

const START: Pot[] = [
  { water: 'moist', temp: 'warm', light: true },
  { water: 'dry', temp: 'warm', light: true },
  { water: 'flooded', temp: 'warm', light: true },
  { water: 'moist', temp: 'cold', light: true },
]
const WATER: Record<Water, string> = { dry: 'Dry cotton', moist: 'Moist cotton', flooded: 'Under boiled, cooled water (no air)' }
const TEMP: Record<Temp, string> = { cold: 'Fridge (4 °C)', warm: 'Room (25 °C)', hot: 'Oven-hot (50 °C)' }

export default function GerminationLab() {
  const [pots, setPots] = useState<Pot[]>(START)
  const [day, setDay] = useState(0)
  const set = (i: number, patch: Partial<Pot>) => { setPots((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x))); setDay(0) }
  return (
    <LabFrame labId="germination-lab" title="Germination Lab" subtitle="What does a seed need to start growing? Set up a fair test with four jars." howTo={<p>Each jar has bean seeds. Change ONE condition per jar, predict what will happen, then move the day slider forward to watch. Pot A is the <b>control</b>: everything a seed might need.</p>}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {pots.map((p, i) => {
          const h = seedlingHeight(p, day)
          const g = germinationDay(p)
          return (
            <div key={i} className="space-y-2 rounded-2xl border p-3">
              <p className="font-heading font-semibold">Jar {'ABCD'[i]}{i === 0 ? ' (control)' : ''}</p>
              <svg viewBox="0 0 100 120" className={cn('w-full rounded-lg', p.light ? 'bg-sky-50 dark:bg-slate-800' : 'bg-slate-800')} role="img" aria-label={`Jar ${'ABCD'[i]}: ${h > 0 ? `seedling ${h} cm, ${seedlingColour(p)}` : 'no germination yet'}`}>
                <rect x={15} y={40} width={70} height={75} rx={6} fill="none" stroke="#94a3b8" strokeWidth={2} />
                {p.water === 'flooded' && <rect x={16} y={50} width={68} height={64} fill="#38bdf8" opacity={0.4} />}
                <rect x={16} y={100} width={68} height={14} fill={p.water === 'dry' ? '#f5f5f4' : '#e0f2fe'} />
                <ellipse cx={50} cy={100} rx={9} ry={6} fill="#a16207" />
                {h > 0 && (
                  <>
                    <path d={`M50 98 Q ${p.light ? 50 : 47} ${98 - h * 3} 50 ${98 - Math.min(80, h * 6)}`} stroke={p.light ? '#16a34a' : '#fde047'} strokeWidth={p.light ? 3 : 1.5} fill="none" />
                    <ellipse cx={45} cy={98 - Math.min(80, h * 6)} rx={6} ry={3} fill={p.light ? '#22c55e' : '#fef08a'} />
                    <ellipse cx={55} cy={98 - Math.min(80, h * 6)} rx={6} ry={3} fill={p.light ? '#22c55e' : '#fef08a'} />
                  </>
                )}
                {day > 0 && g === null && <text x={50} y={30} fontSize={9} textAnchor="middle" fill="#ef4444">no growth</text>}
              </svg>
              <select aria-label={`Jar ${'ABCD'[i]} water`} className="w-full rounded-md border bg-background px-2 py-1 text-xs" value={p.water} onChange={(e) => set(i, { water: e.target.value as Water })}>
                {Object.entries(WATER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select aria-label={`Jar ${'ABCD'[i]} temperature`} className="w-full rounded-md border bg-background px-2 py-1 text-xs" value={p.temp} onChange={(e) => set(i, { temp: e.target.value as Temp })}>
                {Object.entries(TEMP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <Button size="sm" variant="outline" className="w-full" onClick={() => set(i, { light: !p.light })}>{p.light ? '☀️ In the light' : '🌑 In a dark cupboard'}</Button>
            </div>
          )
        })}
      </div>
      <label className="mt-3 block text-sm">Day: <b>{day}</b>
        <Slider value={[day]} min={0} max={10} step={1} onValueChange={([v]) => setDay(v)} className="mt-1.5" aria-label="Day" />
      </label>
      {day >= 5 && (
        <p role="status" className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">
          Seeds need <b>water</b>, <b>air</b> (oxygen for respiration) and a <b>suitable temperature</b> to germinate. They do <b>not</b> need light to germinate, because they use food stored inside the seed. But a seedling grown in the dark is tall, thin and pale yellow, because it needs light to make chlorophyll and its own food.
        </p>
      )}
    </LabFrame>
  )
}
