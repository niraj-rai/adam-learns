import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { bubbles, limitingFactor, rate } from './model'

export default function PhotosynthesisFactory() {
  const [tab, setTab] = useState<'factory' | 'starch'>('factory')
  return (
    <LabFrame labId="photosynthesis-factory" title="Photosynthesis Factory" subtitle="Leaves are food factories powered by sunlight. What do they need, and what limits them?" howTo={<p>Tab 1: control light, carbon dioxide, water and temperature for a water plant (Hydrilla), and count the oxygen bubbles. Find the limiting factor! Tab 2: test leaves for starch to prove that photosynthesis needs light and chlorophyll.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['factory', '🏭 The factory'], ['starch', '🍃 Starch test']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'factory' ? <Factory /> : <StarchTest />}
    </LabFrame>
  )
}

function Factory() {
  const [light, setLight] = useState(40)
  const [co2, setCo2] = useState(70)
  const [water, setWater] = useState(90)
  const [temp, setTemp] = useState(28)
  const r = rate(light, co2, water, temp)
  const lim = limitingFactor(light, co2, water, temp)
  const n = bubbles(r)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 240 220" className="w-full rounded-2xl border bg-sky-50 dark:bg-slate-900" role="img" aria-label={`Hydrilla giving off ${n} bubbles per minute`}>
        <text x={200} y={30} fontSize={24 + light / 5} opacity={0.3 + light / 150}>☀️</text>
        <rect x={60} y={50} width={100} height={160} rx={6} fill="#bae6fd" opacity={0.5} stroke="#64748b" />
        <path d="M110 205 C 100 170, 120 140, 105 100 M110 180 l-15 -8 M108 160 l16 -8 M106 130 l-15 -8 M105 110 l14 -6" stroke="#16a34a" strokeWidth={3} fill="none" />
        {Array.from({ length: Math.min(12, n) }, (_, i) => (
          <motion.circle key={i} cx={104 + (i % 3) * 3} r={2.5} fill="#fff" stroke="#38bdf8" initial={{ cy: 100 }} animate={{ cy: [100, 55] }} transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.25, ease: 'easeIn' }} />
        ))}
        <text x={110} y={45} fontSize={9} textAnchor="middle" className="fill-muted-foreground">oxygen bubbles</text>
      </svg>
      <div className="space-y-3">
        {([['Light intensity', light, setLight], ['Carbon dioxide', co2, setCo2], ['Water', water, setWater]] as const).map(([l, v, set]) => (
          <label key={l} className="block text-sm">{l}: <b>{v}%</b>
            <Slider value={[v]} min={0} max={100} step={5} onValueChange={([x]) => set(x)} className="mt-1.5" aria-label={l} />
          </label>
        ))}
        <label className="block text-sm">Temperature: <b>{temp} °C</b>
          <Slider value={[temp]} min={0} max={50} step={2} onValueChange={([x]) => setTemp(x)} className="mt-1.5" aria-label="Temperature" />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Readout label="Bubbles per minute" value={n} />
          <Readout label="Limiting factor" value={r === 0 && temp >= 45 ? 'too hot!' : lim} />
        </div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-center text-sm font-semibold">carbon dioxide + water → (sunlight, chlorophyll) → glucose + oxygen</p>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The rate is set by whichever ingredient is in shortest supply: the <b>limiting factor</b>. Right now it's <b>{lim}</b>. Increase something else and nothing changes; increase the limiting factor and the bubbles speed up. Farmers use this in greenhouses by adding light and carbon dioxide.</p>
      </div>
    </div>
  )
}

function StarchTest() {
  const [cover, setCover] = useState(true)
  const [tested, setTested] = useState(false)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 240 180" className="w-full rounded-2xl border bg-background" role="img" aria-label={tested ? 'Leaf after iodine test' : 'Variegated leaf with a black paper strip'}>
        {/* whole leaf: green before the test, brown (iodine, no starch) after */}
        <path d="M120 10 C 200 30, 220 120, 120 170 C 20 120, 40 30, 120 10 Z" fill={tested ? '#b45309' : '#22c55e'} stroke="#15803d" />
        {/* left half has no chlorophyll: pale before, stays brown after */}
        {!tested && <path d="M120 10 C 40 30, 20 120, 120 170 Z" fill="#fef9c3" />}
        {/* right half (green, in light) turns blue-black: starch */}
        {tested && <path d="M120 10 C 200 30, 220 120, 120 170 Z" fill="#1e1b4b" opacity={0.9} />}
        {/* the part of the green half under the black strip had no light: stays brown */}
        {tested && cover && <rect x={120} y={92} width={72} height={26} fill="#b45309" />}
        {!tested && cover && <rect x={55} y={92} width={130} height={26} fill="#111827" rx={3} />}
        <line x1={120} y1={10} x2={120} y2={170} stroke="#15803d" />
      </svg>
      <div className="space-y-3">
        <p className="text-sm">This leaf is <b>variegated</b>: the right half is green, the left half is pale (no chlorophyll).</p>
        <Button size="sm" variant={cover ? 'default' : 'outline'} disabled={tested} onClick={() => setCover((c) => !c)}>⬛ {cover ? 'Black paper strip on' : 'No black paper'}</Button>
        <div className="flex gap-2">
          <Button onClick={() => setTested(true)} disabled={tested}>🧪 Sunlight 6 h → boil in alcohol → add iodine</Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setTested(false)}>↺ New leaf</Button>
      </div>
      {tested && <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">Blue-black means <b>starch</b> was made. Only the parts that were <b>green</b> AND <b>in the light</b> turned blue-black. Pale parts (no chlorophyll) and the part under the black paper (no light) stayed brown. So photosynthesis needs both <b>chlorophyll</b> and <b>light</b>. (Boiling in alcohol removes the green colour so the iodine result is easy to see; always heat alcohol in a water bath, never over a flame.)</p>}
    </div>
  )
}
