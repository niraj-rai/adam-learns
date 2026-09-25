import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { ACTIVITIES, airFlow, limewaterSeconds, litresPerMinute, lungFill } from './model'

export default function BreathingLab() {
  const [tab, setTab] = useState<'model' | 'rate' | 'lime'>('model')
  return (
    <LabFrame labId="breathing-lab" title="Breathing Lab" subtitle="How do we breathe in and out, how does exercise change it, and what's different about the air we breathe out?" howTo={<p>Tab 1: pull the rubber diaphragm of a bell-jar model and watch the balloon lungs. Tab 2: compare breathing rates. Tab 3: bubble inhaled and exhaled air through limewater.</p>}>
      <div className="mb-4 inline-flex flex-wrap rounded-lg border p-1 text-sm" role="tablist">
        {([['model', '🫁 Bell-jar model'], ['rate', '🏃 Breathing rate'], ['lime', '🧪 Limewater test']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'model' && <BellJar />}
      {tab === 'rate' && <Rate />}
      {tab === 'lime' && <Lime />}
    </LabFrame>
  )
}

function BellJar() {
  const [pull, setPull] = useState(0.2)
  const prev = useRef(0.2)
  const [flow, setFlow] = useState<'in' | 'out' | 'none'>('none')
  const fill = lungFill(pull)
  const move = (v: number) => { setFlow(airFlow(prev.current, v)); prev.current = v; setPull(v) }
  const diaY = 180 + pull * 30
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox="0 0 220 240" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Bell-jar model: diaphragm ${pull > 0.5 ? 'pulled down' : 'up'}, lungs ${fill > 0.5 ? 'inflated' : 'deflated'}`}>
        <path d="M50 180 V60 Q50 30 110 30 Q170 30 170 60 V180" fill="#e0f2fe" fillOpacity={0.4} stroke="#64748b" strokeWidth={2} />
        <path d={`M50 180 Q110 ${diaY} 170 180`} fill="none" stroke="#b45309" strokeWidth={4} />
        <line x1={110} y1={(180 + diaY) / 2} x2={110} y2={(180 + diaY) / 2 + 25} stroke="#b45309" strokeWidth={3} />
        <path d="M110 5 V60 M110 60 L85 85 M110 60 L135 85" stroke="#64748b" strokeWidth={4} fill="none" />
        <motion.ellipse cx={80} cy={110} animate={{ rx: 16 + fill * 16, ry: 22 + fill * 20 }} fill="#fda4af" stroke="#e11d48" />
        <motion.ellipse cx={140} cy={110} animate={{ rx: 16 + fill * 16, ry: 22 + fill * 20 }} fill="#fda4af" stroke="#e11d48" />
        {flow !== 'none' && <text x={125} y={18} fontSize={11} className="fill-foreground">{flow === 'in' ? '⬇ air in' : '⬆ air out'}</text>}
        <text x={20} y={80} fontSize={9} className="fill-muted-foreground">chest</text>
        <text x={172} y={200} fontSize={9} className="fill-muted-foreground">diaphragm</text>
      </svg>
      <div className="space-y-3">
        <label className="block text-sm">Pull the diaphragm down:
          <Slider value={[pull]} min={0} max={1} step={0.05} onValueChange={([v]) => move(v)} className="mt-1.5" aria-label="Diaphragm position" />
        </label>
        <Readout label="Air flow" value={flow === 'in' ? 'breathing IN' : flow === 'out' ? 'breathing OUT' : '–'} />
        <p className="rounded-lg bg-chem-soft p-3 text-sm">When the <b>diaphragm</b> moves down (and the ribs move up and out), the space inside the chest gets bigger and the pressure drops, so air rushes into the lungs. When it moves back up, the space shrinks and air is pushed out. The bell jar is the chest, the balloons are the lungs and the rubber sheet is the diaphragm.</p>
      </div>
    </div>
  )
}

function Rate() {
  const [aid, setAid] = useState('rest')
  const a = ACTIVITIES.find((x) => x.id === aid)!
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">{ACTIVITIES.map((x) => <Button key={x.id} size="sm" variant={x.id === aid ? 'default' : 'outline'} onClick={() => setAid(x.id)}>{x.emoji} {x.name}</Button>)}</div>
      <div className="flex items-center justify-center gap-8 rounded-2xl border bg-background p-6">
        <motion.span key={aid} className="text-6xl" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 60 / a.breaths }}>🫁</motion.span>
        <motion.span key={`h${aid}`} className="text-5xl" animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 60 / a.heart }}>❤️</motion.span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Readout label="Breaths per minute" value={a.breaths} />
        <Readout label="Air breathed per minute" value={`${litresPerMinute(a.breaths)} L`} />
        <Readout label="Heart beats per minute" value={a.heart} />
      </div>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">During exercise, muscles <b>respire</b> faster to release energy: glucose + oxygen → carbon dioxide + water + energy. So we breathe faster and deeper to take in more oxygen and remove more carbon dioxide, and the heart beats faster to carry them. Try it: count your breaths for one minute sitting down, then after 30 jumping jacks!</p>
    </div>
  )
}

function Lime() {
  const [t, setT] = useState(0)
  const milky = (air: 'inhaled' | 'exhaled') => Math.min(1, t / limewaterSeconds(air))
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {(['inhaled', 'exhaled'] as const).map((air) => (
          <div key={air} className="flex flex-col items-center gap-2 rounded-2xl border bg-background p-3">
            <svg viewBox="0 0 60 110" className="h-32" role="img" aria-label={`${air} air: limewater ${milky(air) > 0.5 ? 'milky' : 'clear'}`}>
              <path d="M15 5 V90 Q15 105 30 105 Q45 105 45 90 V5" fill="none" stroke="#94a3b8" strokeWidth={2} />
              <path d="M17 35 V90 Q17 103 30 103 Q43 103 43 90 V35 Z" fill={`rgba(241,245,249,${0.25 + milky(air) * 0.75})`} stroke="#cbd5e1" />
              {t > 0 && [50, 65, 80].map((y) => <circle key={y} cx={30} cy={y} r={2} fill="#fff" stroke="#94a3b8" />)}
            </svg>
            <p className="text-sm font-semibold capitalize">{air} air</p>
            <Readout label="Limewater" value={milky(air) >= 1 ? 'milky' : milky(air) > 0.3 ? 'turning cloudy' : 'clear'} />
          </div>
        ))}
      </div>
      <label className="block text-sm">Seconds of bubbling: <b>{t}</b>
        <Slider value={[t]} min={0} max={60} step={5} onValueChange={([v]) => setT(v)} className="mt-1.5" aria-label="Seconds of bubbling" />
      </label>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Limewater turns milky with <b>carbon dioxide</b>. Air we breathe out turns it milky within about 20 seconds; the air around us barely changes it. So we breathe out much more carbon dioxide than we breathe in: it's a waste product of respiration in our cells.</p>
    </div>
  )
}
