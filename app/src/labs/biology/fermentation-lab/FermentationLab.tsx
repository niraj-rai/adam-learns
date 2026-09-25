import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { curdHours, doughRise } from './model'

export default function FermentationLab() {
  const [tab, setTab] = useState<'dough' | 'curd'>('dough')
  return (
    <LabFrame labId="fermentation-lab" title="Fermentation Lab" subtitle="Tiny fungi and bacteria turn dough into bread and milk into curd. What conditions do they like?" howTo={<p>Tab 1: add yeast to dough and change the temperature, time and sugar. Tab 2: set curd the way Indian homes have for centuries: warm milk, a spoonful of old curd, and patience.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['dough', '🍞 Rising dough'], ['curd', '🥛 Setting curd']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'dough' ? <Dough /> : <Curd />}
    </LabFrame>
  )
}

function Dough() {
  const [temp, setTemp] = useState(30)
  const [yeast, setYeast] = useState(1)
  const [hours, setHours] = useState(1)
  const [sugar, setSugar] = useState(true)
  const rise = doughRise(temp, yeast, hours, sugar)
  const h = 50 * (1 + rise / 100)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 240 200" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Dough has risen ${rise}%`}>
        <rect x={60} y={40} width={120} height={150} rx={8} fill="none" stroke="#94a3b8" strokeWidth={2} />
        <motion.rect x={62} width={116} rx={6} fill="#fde68a" animate={{ y: 190 - h, height: h }} transition={{ type: 'spring', stiffness: 60 }} />
        {Array.from({ length: Math.round(rise / 10) }, (_, i) => <circle key={i} cx={75 + ((i * 29) % 90)} cy={185 - ((i * 37) % Math.max(10, h - 10))} r={3} fill="#fff" opacity={0.8} />)}
        <line x1={55} y1={140} x2={185} y2={140} stroke="#ef4444" strokeDasharray="4 3" />
        <text x={190} y={143} fontSize={9} className="fill-muted-foreground">start</text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Temperature: <b>{temp} °C</b>
          <Slider value={[temp]} min={5} max={70} step={5} onValueChange={([v]) => setTemp(v)} className="mt-1.5" aria-label="Temperature" />
        </label>
        <label className="block text-sm">Yeast: <b>{yeast} tsp</b>
          <Slider value={[yeast]} min={0} max={2} step={0.5} onValueChange={([v]) => setYeast(v)} className="mt-1.5" aria-label="Yeast" />
        </label>
        <label className="block text-sm">Time: <b>{hours} h</b>
          <Slider value={[hours]} min={0} max={3} step={0.5} onValueChange={([v]) => setHours(v)} className="mt-1.5" aria-label="Time" />
        </label>
        <Button size="sm" variant={sugar ? 'default' : 'outline'} onClick={() => setSugar((x) => !x)}>🍬 {sugar ? 'With a spoon of sugar' : 'No sugar'}</Button>
        <Readout label="Rise in volume" value={`${rise}%`} />
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">
        {yeast === 0 ? 'No yeast, no bubbles: the dough stays flat.' : temp >= 55 ? 'Too hot! The yeast has been killed, so no gas is made.' : temp <= 10 ? 'Too cold: the yeast is barely active.' : 'Yeast feeds on sugar and releases carbon dioxide gas (plus a little alcohol), which makes bubbles that puff up the dough. This is fermentation. It works best around 35 °C.'}
      </p>
    </div>
  )
}

function Curd() {
  const [temp, setTemp] = useState(40)
  const [starter, setStarter] = useState(true)
  const [hours, setHours] = useState(3)
  const need = curdHours(temp, starter)
  const set = need <= hours
  const progress = need === Infinity ? 0 : Math.min(1, hours / need)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="grid place-items-center rounded-2xl border bg-background p-4">
        <svg viewBox="0 0 160 140" className="w-48" role="img" aria-label={set ? 'Set curd' : 'Runny milk'}>
          <path d="M20 40 Q20 130 80 130 Q140 130 140 40 Z" fill="#e2e8f0" stroke="#94a3b8" />
          <motion.ellipse cx={80} cy={48} rx={58} ry={10} animate={{ fill: set ? '#fffbeb' : '#f8fafc' }} stroke="#cbd5e1" />
          {set && <path d="M45 48 q10 -6 20 0 t20 0 t20 0" stroke="#e7e5e4" fill="none" />}
          <text x={80} y={100} textAnchor="middle" fontSize={11} className="fill-foreground">{set ? 'Set curd! 😋' : progress > 0.5 ? 'thickening…' : 'still milk'}</text>
        </svg>
      </div>
      <div className="space-y-3">
        <label className="block text-sm">Milk temperature when the starter is added: <b>{temp} °C</b>
          <Slider value={[temp]} min={5} max={95} step={5} onValueChange={([v]) => setTemp(v)} className="mt-1.5" aria-label="Milk temperature" />
        </label>
        <label className="block text-sm">Hours left to set: <b>{hours} h</b>
          <Slider value={[hours]} min={1} max={16} step={1} onValueChange={([v]) => setHours(v)} className="mt-1.5" aria-label="Hours" />
        </label>
        <Button size="sm" variant={starter ? 'default' : 'outline'} onClick={() => setStarter((x) => !x)}>🥄 {starter ? 'With a spoon of curd (starter)' : 'No starter'}</Button>
        <Readout label="Time needed to set" value={need === Infinity ? 'never sets' : `about ${need} h`} />
      </div>
      <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm md:col-span-2">
        {!starter ? 'Without a starter, there are no Lactobacillus bacteria to do the work.' : temp >= 55 ? 'The milk is too hot: it kills the Lactobacillus bacteria in the starter.' : temp < 15 ? 'Too cold: the bacteria work very slowly. That’s why curd takes longer to set in winter.' : 'Lactobacillus bacteria turn the milk sugar (lactose) into lactic acid, which makes the milk proteins thicken into curd. Lukewarm milk (around 40 °C) works best.'}
      </p>
    </div>
  )
}
