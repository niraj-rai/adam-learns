import { motion } from 'motion/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { DISCS, HANDS, zoneFor } from './model'

export default function PetriLab() {
  const [tab, setTab] = useState<'discs' | 'hands'>('discs')
  return (
    <LabFrame labId="petri-lab" title="Petri Dish Lab" subtitle="Grow bacteria safely on a plate and test what stops them: antibiotics, soap, sanitiser, and good old handwashing." howTo={<p>Tab 1: place discs soaked in different substances on a plate covered with bacteria, and incubate. A clear ring means the bacteria couldn't grow. Try a resistant strain! Tab 2: compare fingerprints before and after washing.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['discs', '💊 Inhibition zones'], ['hands', '🖐️ Handwashing test']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'discs' ? <Discs /> : <Hands />}
    </LabFrame>
  )
}

function Plate({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg viewBox="-110 -110 220 220" className="w-full max-w-72" role="img" aria-label={label}>
      <circle r={105} fill="#fef9c3" stroke="#cbd5e1" strokeWidth={4} />
      {children}
    </svg>
  )
}

function Discs() {
  const [incubated, setIncubated] = useState(false)
  const [resistant, setResistant] = useState(false)
  const pos = [[-45, -45], [45, -45], [-45, 45], [45, 45]]
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Plate label={incubated ? 'Plate after incubation with clear zones around some discs' : 'Plate before incubation'}>
        {incubated && <circle r={100} fill="#e7e5e4" opacity={0.9} />}
        {DISCS.map((d, i) => {
          const z = zoneFor(d.id, resistant)
          return (
            <g key={d.id} transform={`translate(${pos[i][0]} ${pos[i][1]})`}>
              {incubated && z > 0 && <motion.circle initial={{ r: 0 }} animate={{ r: z * 1.5 }} fill="#fef9c3" />}
              <circle r={9} fill="#fff" stroke="#94a3b8" />
              <text y={4} fontSize={10} textAnchor="middle">{d.emoji}</text>
            </g>
          )
        })}
      </Plate>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIncubated(true)} disabled={incubated}>🌡️ Incubate for 2 days at 37 °C</Button>
          <Button variant="outline" onClick={() => setIncubated(false)}>↺ New plate</Button>
          <Button variant={resistant ? 'default' : 'outline'} onClick={() => { setResistant((r) => !r); setIncubated(false) }}>{resistant ? '🦠 Antibiotic-resistant strain' : '🦠 Ordinary strain'}</Button>
        </div>
        {incubated && (
          <div className="grid grid-cols-2 gap-2">
            {DISCS.map((d) => <Readout key={d.id} label={`${d.emoji} ${d.name}`} value={`${zoneFor(d.id, resistant)} mm clear zone`} />)}
          </div>
        )}
        <p role="status" className="rounded-lg bg-chem-soft p-3 text-sm">
          {!incubated ? 'The whole plate is spread with bacteria. The water disc is the control. Predict which disc will have the biggest clear zone.' : resistant ? '⚠️ The antibiotic no longer works against this strain! When antibiotics are overused or courses aren’t finished, resistant bacteria survive and spread. Soap and sanitiser still work because they destroy bacteria in a different way.' : 'The bigger the clear zone, the better the substance stops bacteria. Antibiotics, like penicillin (discovered from a mould by Alexander Fleming in 1928), kill bacteria. They do NOT work against viruses like the common cold.'}
        </p>
      </div>
    </div>
  )
}

function Hands() {
  const [hid, setHid] = useState('unwashed')
  const h = HANDS.find((x) => x.id === hid)!
  const dots = Array.from({ length: h.colonies }, (_, i) => ({ x: Math.cos(i * 2.399) * Math.sqrt(i / h.colonies) * 90, y: Math.sin(i * 2.399) * Math.sqrt(i / h.colonies) * 90, r: 2 + (i % 3) }))
  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Plate label={`${h.colonies} bacterial colonies`}>
        {dots.map((d, i) => <circle key={`${hid}-${i}`} cx={d.x} cy={d.y} r={d.r} fill={i % 4 ? '#f5f5f4' : '#fb923c'} stroke="#a8a29e" />)}
      </Plate>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">{HANDS.map((x) => <Button key={x.id} size="sm" variant={x.id === hid ? 'default' : 'outline'} onClick={() => setHid(x.id)}>{x.name}</Button>)}</div>
        <Readout label="Colonies after 2 days" value={h.colonies} />
        <p className="rounded-lg bg-chem-soft p-3 text-sm">Each spot is a colony that grew from one or a few bacteria on the fingertip. A quick rinse removes some, but <b>soap and water for 20 seconds</b> removes far more: soap lifts grease and microbes off the skin so water can wash them away. Washing hands before eating and after using the toilet prevents diseases like diarrhoea and typhoid. (Illustrative results.)</p>
      </div>
    </div>
  )
}
