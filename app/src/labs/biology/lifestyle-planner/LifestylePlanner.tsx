import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { type Day, GOALS, hoursUsed, score } from './model'

const LABEL: Record<keyof Day, string> = { sleep: '😴 Sleep', active: '⚽ Physical activity', screen: '📱 Recreational screen time', junk: '🍟 Junk-food servings', fruitVeg: '🥦 Fruit and vegetable servings' }
const MAX: Record<keyof Day, number> = { sleep: 12, active: 4, screen: 8, junk: 5, fruitVeg: 8 }
const STEP: Record<keyof Day, number> = { sleep: 0.5, active: 0.5, screen: 0.5, junk: 1, fruitVeg: 1 }

export default function LifestylePlanner() {
  const [d, setD] = useState<Day>({ sleep: 7, active: 0.5, screen: 4, junk: 2, fruitVeg: 2 })
  const s = score(d)
  const left = 24 - hoursUsed(d) - 7 // school and travel ≈ 7 h
  return (
    <LabFrame labId="lifestyle-planner" title="Healthy Day Planner" subtitle="Non-communicable diseases like type 2 diabetes and heart disease are linked to lifestyle. Plan a day that builds lifelong health." howTo={<p>Set how you spend your day and what you eat. Try to get every bar into the healthy range, and still have time for school, homework and family!</p>}>
      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="space-y-3">
          {(Object.keys(LABEL) as (keyof Day)[]).map((k) => {
            const ok = d[k] >= GOALS[k].min && d[k] <= GOALS[k].max
            return (
              <label key={k} className="block text-sm">
                <span className="flex justify-between"><span>{LABEL[k]}: <b>{d[k]} {GOALS[k].unit}</b></span><span className={cn(ok ? 'text-success' : 'text-destructive')}>{ok ? '✓ healthy' : `aim ${GOALS[k].min}–${GOALS[k].max}`}</span></span>
                <Slider value={[d[k]]} min={0} max={MAX[k]} step={STEP[k]} onValueChange={([v]) => setD((x) => ({ ...x, [k]: v }))} className="mt-1.5" aria-label={LABEL[k]} />
              </label>
            )
          })}
        </div>
        <div className="space-y-2">
          <Readout label="Healthy-day score" value={`${s.points} / 100`} />
          <Readout label="Hours left for homework, meals, family" value={left >= 0 ? `${left} h` : 'over 24 h!'} className={cn(left < 1 && 'text-destructive')} />
          {s.fix.length > 0 && <div className="space-y-1 rounded-lg bg-warn-soft p-2 text-xs">{s.fix.map((k) => <p key={k}>• {GOALS[k].tip}</p>)}</div>}
          {s.points === 100 && <p role="status" className="rounded-lg bg-success-soft p-2 text-sm">✅ A great day for your body and mind!</p>}
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-chem-soft px-4 py-2 text-sm">Habits formed as a teenager often last for life. Regular activity, enough sleep, a balanced diet with plenty of fruit and vegetables, limited junk food and screen time, and no tobacco greatly lower the risk of <b>non-communicable diseases</b> such as type 2 diabetes, heart disease and some cancers. (Guidelines are simplified; everyone is different.)</p>
    </LabFrame>
  )
}
