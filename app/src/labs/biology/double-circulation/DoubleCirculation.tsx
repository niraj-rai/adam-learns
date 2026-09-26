import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LabFrame } from '../../_kit/LabFrame'

const STEPS = [
  { at: 'body', text: 'Deoxygenated blood returns from the body in the vena cava.', blood: 'de' },
  { at: 'RA', text: 'It enters the right atrium, which contracts to push it into the right ventricle.', blood: 'de' },
  { at: 'RV', text: 'The right ventricle pumps it through the pulmonary artery to the lungs.', blood: 'de' },
  { at: 'lungs', text: 'In the lungs, blood picks up oxygen and gives up carbon dioxide.', blood: 'ox' },
  { at: 'LA', text: 'Oxygenated blood returns in the pulmonary vein to the left atrium.', blood: 'ox' },
  { at: 'LV', text: 'The thick-walled left ventricle pumps it through the aorta to the whole body.', blood: 'ox' },
  { at: 'body', text: 'In body capillaries, oxygen and food pass to the cells; the blood becomes deoxygenated again.', blood: 'de' },
]
const POS: Record<string, [number, number]> = { lungs: [160, 30], RA: [120, 100], LA: [200, 100], RV: [120, 150], LV: [200, 150], body: [160, 220] }

export default function DoubleCirculation() {
  const [s, setS] = useState(0)
  const step = STEPS[s]
  const [x, y] = POS[step.at]
  return (
    <LabFrame labId="double-circulation" title="Double Circulation" subtitle="Blood passes through the heart twice on each trip round the body: once to the lungs and once to the body." howTo={<p>Step through the journey of a drop of blood. Red is oxygen-rich; blue is oxygen-poor.</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <svg viewBox="0 0 320 250" className="w-full rounded-2xl border bg-background" role="img" aria-label={`Blood at ${step.at}`}>
          <rect x={110} y={10} width={100} height={40} rx={18} fill="#fecdd3" /><text x={160} y={35} textAnchor="middle" fontSize={12}>🫁 lungs</text>
          <rect x={95} y={80} width={130} height={100} rx={40} fill="#fda4af" stroke="#be123c" strokeWidth={2} />
          <line x1={160} y1={82} x2={160} y2={178} stroke="#be123c" strokeWidth={4} />
          {[['RA', 'right atrium'], ['LA', 'left atrium'], ['RV', 'right ventricle'], ['LV', 'left ventricle']].map(([k, l]) => <text key={k} x={POS[k][0]} y={POS[k][1] + 4} textAnchor="middle" fontSize={9} fill="#4c0519">{l}</text>)}
          <rect x={110} y={200} width={100} height={40} rx={18} fill="#fde68a" /><text x={160} y={225} textAnchor="middle" fontSize={12}>🧍 body</text>
          <path d="M100,150 C40,150 40,40 110,30" fill="none" stroke="#3b82f6" strokeWidth={4} /><path d="M210,30 C280,40 280,100 225,100" fill="none" stroke="#ef4444" strokeWidth={4} />
          <path d="M225,150 C290,160 280,220 210,220" fill="none" stroke="#ef4444" strokeWidth={4} /><path d="M110,220 C40,220 40,110 95,100" fill="none" stroke="#3b82f6" strokeWidth={4} />
          <circle cx={x} cy={y - 14} r={9} fill={step.blood === 'ox' ? '#ef4444' : '#3b82f6'} stroke="white" strokeWidth={2} />
          <text x={8} y={140} fontSize={9} fill="#3b82f6">pulmonary artery</text><text x={250} y={70} fontSize={9} fill="#ef4444">pulmonary vein</text>
          <text x={250} y={190} fontSize={9} fill="#ef4444">aorta</text><text x={8} y={200} fontSize={9} fill="#3b82f6">vena cava</text>
        </svg>
        <div className="space-y-3">
          <ol className="space-y-1 text-sm">{STEPS.map((st, k) => <li key={k} className={cn('rounded-lg px-3 py-1.5', k === s ? 'bg-chem-soft font-semibold' : k < s ? 'text-muted-foreground' : 'opacity-50')}>{k + 1}. {st.text}</li>)}</ol>
          <div className="flex gap-2"><Button variant="outline" disabled={s === 0} onClick={() => setS(s - 1)}>← Back</Button><Button onClick={() => setS((s + 1) % STEPS.length)}>{s === STEPS.length - 1 ? '↺ Again' : 'Next →'}</Button></div>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Mammals and birds have a four-chambered heart that keeps oxygenated and deoxygenated blood completely separate. This <b>double circulation</b> delivers oxygen efficiently to support their high energy needs and steady body temperature. Fish have a two-chambered heart and a single circulation. <b>Arteries</b> carry blood away from the heart at high pressure; <b>veins</b> bring it back and have valves; <b>capillaries</b> are one cell thick for exchange.</p>
    </LabFrame>
  )
}
