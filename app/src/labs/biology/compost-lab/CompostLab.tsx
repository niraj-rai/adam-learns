import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { compostDays, ITEMS, type Moisture, smelly } from './model'

export default function CompostLab() {
  const [tab, setTab] = useState<'bin' | 'nodules'>('bin')
  return (
    <LabFrame labId="compost-lab" title="Decomposers and Nitrogen Fixers" subtitle="Microbes recycle dead matter into rich compost, and some even make fertiliser from the air." howTo={<p>Tab 1: run a kitchen compost bin. Choose what goes in, then balance greens and browns, dampness and air. Tab 2: see how Rhizobium bacteria in the roots of pulses feed the soil.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['bin', '♻️ Compost bin'], ['nodules', '🌱 Root nodules']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'bin' ? <Bin /> : <Nodules />}
    </LabFrame>
  )
}

function Bin() {
  const [inBin, setInBin] = useState<string[]>([])
  const [greens, setGreens] = useState(80)
  const [moisture, setMoisture] = useState<Moisture>('soggy')
  const [turned, setTurned] = useState(false)
  const days = compostDays(greens, moisture, turned)
  const bad = inBin.map((id) => ITEMS.find((i) => i.id === id)!).filter((i) => !i.decomposes)
  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1 text-sm font-semibold">What goes in the bin?</p>
        <div className="flex flex-wrap gap-1.5">
          {ITEMS.map((i) => <button key={i.id} type="button" aria-pressed={inBin.includes(i.id)} onClick={() => setInBin((b) => (b.includes(i.id) ? b.filter((x) => x !== i.id) : [...b, i.id]))} className={cn('rounded-full border px-3 py-1 text-sm', inBin.includes(i.id) ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{i.emoji} {i.name}</button>)}
        </div>
        {bad.length > 0 && <p className="mt-2 rounded-lg bg-warn-soft px-3 py-1.5 text-sm">⚠️ {bad.map((b) => b.name).join(', ')} {bad.length > 1 ? 'are' : 'is'} not biodegradable: microbes can't break {bad.length > 1 ? 'them' : 'it'} down. Recycle separately!</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          <label className="block text-sm">Greens (wet kitchen waste): <b>{greens}%</b>, browns (dry leaves, paper): <b>{100 - greens}%</b>
            <Slider value={[greens]} min={0} max={100} step={5} onValueChange={([v]) => setGreens(v)} className="mt-1.5" aria-label="Greens percentage" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['dry', 'damp', 'soggy'] as const).map((m) => <Button key={m} size="sm" variant={moisture === m ? 'default' : 'outline'} onClick={() => setMoisture(m)}>{m === 'dry' ? '🏜️ Dry' : m === 'damp' ? '🧽 Damp (like a wrung-out sponge)' : '💦 Soggy'}</Button>)}
          </div>
          <Button size="sm" variant={turned ? 'default' : 'outline'} onClick={() => setTurned((t) => !t)}>🔄 {turned ? 'Turned every week (air gets in)' : 'Never turned'}</Button>
        </div>
        <div className="space-y-2">
          <Readout label="Compost ready in about" value={`${days} days`} />
          <Readout label="Smell" value={smelly(moisture, turned) ? '🤢 rotten eggs!' : '🌳 earthy'} />
        </div>
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">
        {smelly(moisture, turned) ? 'A soggy bin with no air lets smelly bacteria take over (they work without oxygen). Add dry browns and turn the heap.' : 'Bacteria and fungi (decomposers) break down dead plant and animal matter into simple substances that return to the soil as rich compost. They need food (greens and browns), water and air. Bengaluru encourages homes to compost wet waste to cut landfill.'}
      </p>
    </div>
  )
}

function Nodules() {
  const [crop, setCrop] = useState<'wheat' | 'moong'>('moong')
  const [years, setYears] = useState(1)
  const legume = crop === 'moong'
  const nitrogen = Math.min(100, legume ? 40 + years * 15 : Math.max(10, 40 - years * 8))
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 240 200" className="w-full rounded-2xl border bg-amber-50 dark:bg-stone-900" role="img" aria-label={`${crop} roots ${legume ? 'with nodules' : 'without nodules'}`}>
        <rect y={60} width={240} height={140} fill="#a16207" opacity={0.35} />
        <path d="M120 60 V20 M120 35 q-20 -10 -30 -5 M120 30 q20 -10 30 -4" stroke="#16a34a" strokeWidth={3} fill="none" />
        <path d="M120 60 V160 M120 80 q-30 20 -50 60 M120 95 q30 20 50 55 M120 120 q-15 20 -25 50 M120 130 q15 15 20 40" stroke="#78350f" strokeWidth={2} fill="none" />
        {legume && [[90, 110], [150, 118], [104, 150], [138, 150], [80, 135], [165, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#f9a8d4" stroke="#be185d" />)}
      </svg>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button size="sm" variant={crop === 'moong' ? 'default' : 'outline'} onClick={() => setCrop('moong')}>🫘 Moong (a pulse)</Button>
          <Button size="sm" variant={crop === 'wheat' ? 'default' : 'outline'} onClick={() => setCrop('wheat')}>🌾 Wheat</Button>
        </div>
        <label className="block text-sm">Years grown on the same field: <b>{years}</b>
          <Slider value={[years]} min={1} max={4} step={1} onValueChange={([v]) => setYears(v)} className="mt-1.5" aria-label="Years" />
        </label>
        <Readout label="Soil nitrogen (relative)" value={`${nitrogen}%`} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">
        Plants need nitrogen to make proteins, but they can't use the nitrogen gas in the air. <b>Rhizobium</b> bacteria live in pink swellings called <b>root nodules</b> on pulses such as moong, chana and peas. They <b>fix</b> nitrogen from the air into a form plants can use. That's why farmers rotate crops: growing pulses between wheat or rice crops naturally fertilises the soil.
      </p>
    </div>
  )
}
