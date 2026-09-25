import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { STAGES, starchLeft, totalLengthM } from './model'

const POS: Record<string, [number, number]> = { mouth: [120, 30], oesophagus: [120, 80], stomach: [140, 130], small: [115, 190], large: [120, 225], anus: [120, 270] }

export default function DigestionJourney() {
  const [tab, setTab] = useState<'journey' | 'saliva'>('journey')
  return (
    <LabFrame labId="digestion-journey" title="Digestion Journey" subtitle="Follow a bite of idli–sambar through about 9 metres of your digestive system." howTo={<p>Tab 1: move the food from organ to organ and watch starch, protein and fat being broken down. Tab 2: test how saliva digests starch.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['journey', '🍽️ The journey'], ['saliva', '👄 Saliva test']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'journey' ? <Journey /> : <Saliva />}
    </LabFrame>
  )
}

function Journey() {
  const [i, setI] = useState(0)
  const s = STAGES[i]
  const elapsed = STAGES.slice(0, i + 1).reduce((t, x) => t + x.minutes, 0)
  const [x, y] = POS[s.id]
  return (
    <div className="grid gap-4 md:grid-cols-[240px_1fr]">
      <svg viewBox="0 0 240 290" className="w-full rounded-2xl border bg-rose-50 dark:bg-slate-900" role="img" aria-label={`Food is in the ${s.name}`}>
        <ellipse cx={120} cy={30} rx={28} ry={14} fill="#fda4af" />
        <path d="M120 44 V110" stroke="#fb7185" strokeWidth={8} />
        <path d="M118 110 C 170 95, 185 150, 140 158 C 115 160, 110 140, 118 110 Z" fill="#fda4af" stroke="#e11d48" />
        <path d="M80 175 C 100 165, 150 170, 160 185 C 170 200, 90 205, 85 190 C 80 175, 150 172, 150 195 C 150 210, 95 212, 100 200" fill="none" stroke="#f472b6" strokeWidth={6} />
        <path d="M60 240 V175 H180 V240 H130 V265" fill="none" stroke="#c084fc" strokeWidth={9} />
        <motion.circle r={8} fill="#f59e0b" stroke="#78350f" animate={{ cx: x, cy: y }} transition={{ type: 'spring', stiffness: 60 }} />
      </svg>
      <div className="space-y-3">
        <p className="font-heading text-xl font-semibold">{s.emoji} {s.name}</p>
        <p className="text-sm">{s.happens}</p>
        <div className="grid grid-cols-3 gap-2">
          {(['starch', 'protein', 'fat'] as const).map((n) => (
            <div key={n} className="text-sm">
              <div className="flex justify-between"><span className="capitalize">{n} left</span><span>{s[n]}%</span></div>
              <div className="h-2 rounded-full bg-muted"><motion.div className="h-2 rounded-full bg-chem" animate={{ width: `${s[n]}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Readout label="Length of this part" value={s.lengthCm >= 100 ? `${(s.lengthCm / 100).toFixed(1)} m` : `${s.lengthCm} cm`} />
          <Readout label="Time since swallowing (about)" value={elapsed < 60 ? `${Math.round(elapsed)} min` : `${(elapsed / 60).toFixed(1)} h`} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={i === 0} onClick={() => setI((v) => v - 1)}>← Back</Button>
          <Button disabled={i === STAGES.length - 1} onClick={() => setI((v) => v + 1)}>Next organ →</Button>
        </div>
        {i === STAGES.length - 1 && <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">The whole journey through about {totalLengthM().toFixed(1)} m of gut can take a day or two. Digestion breaks big food molecules into small ones (starch → sugars, proteins → amino acids, fats → fatty acids and glycerol) that can pass into the blood.</p>}
      </div>
    </div>
  )
}

function Saliva() {
  const [min, setMin] = useState(0)
  const colour = (left: number) => `color-mix(in oklab, #1e1b4b ${left}%, #d97706)`
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {[true, false].map((saliva) => {
          const left = starchLeft(min, saliva)
          return (
            <div key={String(saliva)} className="flex flex-col items-center gap-2 rounded-2xl border bg-background p-3">
              <svg viewBox="0 0 60 110" className="h-32" role="img" aria-label={`${saliva ? 'With saliva' : 'Water only'}: ${left}% starch left`}>
                <path d="M15 5 V90 Q15 105 30 105 Q45 105 45 90 V5" fill="none" stroke="#94a3b8" strokeWidth={2} />
                <path d="M17 40 V90 Q17 103 30 103 Q43 103 43 90 V40 Z" fill={colour(left)} />
              </svg>
              <p className="text-sm font-semibold">{saliva ? 'Starch + saliva' : 'Starch + water (control)'}</p>
              <Readout label="Starch left" value={`${left}%`} />
            </div>
          )
        })}
      </div>
      <label className="block text-sm">Minutes at body temperature (37 °C), then add iodine: <b>{min}</b>
        <Slider value={[min]} min={0} max={20} step={1} onValueChange={([v]) => setMin(v)} className="mt-1.5" aria-label="Minutes" />
      </label>
      <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Iodine turns blue-black when starch is present. With saliva, the colour fades to brown as the enzyme <b>amylase</b> breaks starch into sugar. The water tube is the <b>control</b>: it stays blue-black. Chew a piece of roti for a minute: it starts to taste sweet!</p>
    </div>
  )
}
