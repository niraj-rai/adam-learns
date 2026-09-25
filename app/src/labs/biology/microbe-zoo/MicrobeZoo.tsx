import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Microbe, MICROBES, visibleWithLight } from './model'

const SAMPLES = [
  { id: 'pond', name: 'Pond water', emoji: '🏞️' },
  { id: 'curd', name: 'Curd', emoji: '🥛' },
  { id: 'soil', name: 'Soil around pea roots', emoji: '🌱' },
  { id: 'dough', name: 'Bread dough', emoji: '🍞' },
  { id: 'bread', name: 'Old bread', emoji: '🍄' },
  { id: 'blood', name: 'Blood of a malaria patient', emoji: '🩸' },
  { id: 'air', name: 'Air near a sneezing person', emoji: '🤧' },
  { id: 'water', name: 'Untreated drinking water', emoji: '🚰' },
]

function Sprite({ m, i }: { m: Microbe; i: number }) {
  const x = 40 + ((i * 97) % 220)
  const y = 50 + ((i * 61) % 170)
  const move = m.group === 'Protozoa' ? { x: [0, 20, -10, 0], y: [0, -12, 8, 0] } : m.group === 'Bacteria' ? { x: [0, 4, -3, 0], y: [0, -3, 4, 0] } : {}
  const shape = (() => {
    switch (m.id) {
      case 'amoeba': return <path d="M-20 0 Q-25 -18 -5 -20 Q10 -30 20 -12 Q32 0 18 14 Q5 26 -10 18 Q-28 14 -20 0Z" fill="#c7d2fe" stroke="#4f46e5" />
      case 'paramecium': return <g><ellipse rx={24} ry={9} fill="#e0e7ff" stroke="#4338ca" /><path d="M-24 0 h-4 M24 0 h4 M0 -9 v-3 M0 9 v3" stroke="#4338ca" /></g>
      case 'chlamy': return <g><circle r={9} fill="#86efac" stroke="#15803d" /><path d="M-3 -9 q-4 -8 -8 -10 M3 -9 q4 -8 8 -10" stroke="#15803d" fill="none" /></g>
      case 'spirogyra': return <g><rect x={-40} y={-6} width={80} height={12} rx={6} fill="#dcfce7" stroke="#15803d" /><path d="M-38 0 q5 -6 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t8 0" stroke="#16a34a" fill="none" strokeWidth={2} /></g>
      case 'yeast': return <g><ellipse rx={8} ry={6} fill="#fef3c7" stroke="#b45309" /><ellipse cx={8} cy={-4} rx={4} ry={3} fill="#fef3c7" stroke="#b45309" /></g>
      case 'mould': return <g stroke="#475569">{[-10, 0, 10].map((dx) => <g key={dx}><line x1={dx} y1={12} x2={dx} y2={-6} /><circle cx={dx} cy={-9} r={4} fill="#1f2937" /></g>)}</g>
      case 'plasmodium': return <g><circle r={9} fill="#fecaca" stroke="#dc2626" /><circle r={3} fill="#7c3aed" /></g>
      case 'flu': case 'polio': return <text fontSize={10} textAnchor="middle" fill="#64748b">too small to see</text>
      default: return <rect x={-5} y={-1.5} width={10} height={3} rx={1.5} fill="#a855f7" />
    }
  })()
  return <motion.g transform={`translate(${x} ${y})`} animate={move} transition={{ repeat: Infinity, duration: 4 + (i % 3), ease: 'easeInOut' }}>{shape}</motion.g>
}

export default function MicrobeZoo() {
  const [sample, setSample] = useState('pond')
  const [sel, setSel] = useState<string | null>(null)
  const [seen, setSeen] = useState<string[]>([])
  const here = MICROBES.filter((m) => m.sample === sample)
  const m = MICROBES.find((x) => x.id === sel)
  const pick = (id: string) => { setSel(id); setSeen((s) => (s.includes(id) ? s : [...s, id])) }
  return (
    <LabFrame labId="microbe-zoo" title="Microbe Zoo" subtitle="Microorganisms are everywhere: in water, soil, food, air and inside us. Most are harmless, many are helpful, a few cause disease." howTo={<p>Choose a sample and look through the microscope. Tap each microbe to learn its group, size and whether it is a friend or a foe. Can you meet all twelve?</p>}>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {SAMPLES.map((s) => <button key={s.id} type="button" onClick={() => { setSample(s.id); setSel(null) }} className={cn('rounded-full border px-3 py-1 text-sm', s.id === sample ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{s.emoji} {s.name}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        <svg viewBox="0 0 300 260" className="w-full rounded-full border-8 border-slate-800 bg-slate-50" role="img" aria-label={`Microscope view of ${sample}`}>
          {here.map((m, i) => <g key={m.id} onClick={() => pick(m.id)} className="cursor-pointer">{Array.from({ length: m.group === 'Bacteria' ? 6 : m.group === 'Virus' ? 1 : 2 }, (_, k) => <Sprite key={k} m={m} i={i * 7 + k * 3} />)}</g>)}
        </svg>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {here.map((x) => <button key={x.id} type="button" onClick={() => pick(x.id)} className={cn('rounded-lg border px-3 py-1.5 text-sm', sel === x.id ? 'border-chem bg-chem-soft font-semibold' : 'hover:bg-muted')}>{x.emoji} {x.name}</button>)}
          </div>
          {m ? (
            <div className="space-y-2 rounded-xl border p-3 text-sm">
              <p className="font-heading text-lg font-semibold">{m.emoji} {m.name}</p>
              <div className="grid grid-cols-3 gap-2">
                <Readout label="Group" value={m.group} />
                <Readout label="Size" value={m.sizeUm < 1 ? `${m.sizeUm * 1000} nm` : `${m.sizeUm} µm`} />
                <Readout label="Friend or foe?" value={m.role === 'useful' ? '😊 useful' : m.role === 'harmful' ? '⚠️ harmful' : '🤔 both'} />
              </div>
              <p>{m.fact}</p>
              {!visibleWithLight(m) && <p className="text-xs text-muted-foreground">🔭 Viruses are far smaller than bacteria, too small for a light microscope. Scientists use electron microscopes to see them. They are not made of cells and can only reproduce inside living cells.</p>}
            </div>
          ) : <p className="text-sm text-muted-foreground">Tap a microbe to find out about it.</p>}
          <Readout label="Microbes met" value={`${seen.length} / ${MICROBES.length}`} />
        </div>
      </div>
    </LabFrame>
  )
}
