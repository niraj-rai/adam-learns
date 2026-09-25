import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { sfx } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { LabFrame, Readout } from '../../_kit/LabFrame'
import { inUrine, SUBSTANCES, urine } from './model'

export default function KidneyFilter() {
  const [tab, setTab] = useState<'filter' | 'water'>('filter')
  return (
    <LabFrame labId="kidney-filter" title="Kidney Filter" subtitle="Your two kidneys clean all your blood many times a day, removing wastes but keeping what you need." howTo={<p>Tab 1: predict which substances end up in urine, then run the filter. Tab 2: change how much you drink and sweat and see how the kidneys respond.</p>}>
      <div className="mb-4 inline-flex rounded-lg border p-1 text-sm" role="tablist">
        {([['filter', '🫘 Filter the blood'], ['water', '💧 Water balance']] as const).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-md px-3 py-1', tab === k ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>{lbl}</button>
        ))}
      </div>
      {tab === 'filter' ? <Filter /> : <Water />}
    </LabFrame>
  )
}

function Filter() {
  const [guess, setGuess] = useState<Record<string, boolean>>({})
  const [run, setRun] = useState(false)
  const all = SUBSTANCES.every((s) => s.id in guess)
  const correct = SUBSTANCES.filter((s) => guess[s.id] === inUrine(s.id)).length
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {SUBSTANCES.map((s) => (
          <div key={s.id} className={cn('flex items-center justify-between rounded-xl border px-3 py-2 text-sm', run && (guess[s.id] === inUrine(s.id) ? 'border-success bg-success-soft' : 'border-destructive bg-destructive/10'))}>
            <span>{s.name}</span>
            <div className="flex gap-1">
              <Button size="sm" variant={guess[s.id] === true ? 'default' : 'outline'} disabled={run} onClick={() => setGuess((g) => ({ ...g, [s.id]: true }))}>In urine</Button>
              <Button size="sm" variant={guess[s.id] === false ? 'default' : 'outline'} disabled={run} onClick={() => setGuess((g) => ({ ...g, [s.id]: false }))}>Kept in blood</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button disabled={!all || run} onClick={() => { setRun(true); if (correct === SUBSTANCES.length) sfx.win(); else sfx.click() }}>🫘 Run the kidney filter</Button>
        <Button variant="ghost" onClick={() => { setGuess({}); setRun(false) }}>↺ Reset</Button>
        {run && <Readout label="Correct predictions" value={`${correct} / ${SUBSTANCES.length}`} />}
      </div>
      {run && <p role="status" className="rounded-xl bg-chem-soft px-4 py-2 text-sm">Step 1: tiny filters push water and small molecules (glucose, salts, urea) out of the blood; blood cells and proteins are too big and stay in. Step 2: everything useful (all the glucose, most water and salts) is taken back into the blood. What's left, mostly <b>urea, extra water and salts</b>, is urine, stored in the <b>bladder</b>. If kidneys fail, a <b>dialysis</b> machine can filter the blood instead.</p>}
    </div>
  )
}

function Water() {
  const [drank, setDrank] = useState(2)
  const [sweat, setSweat] = useState(0.3)
  const u = urine(drank, sweat)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <label className="block text-sm">Water drunk today: <b>{drank} L</b>
          <Slider value={[drank]} min={0.5} max={4} step={0.25} onValueChange={([v]) => setDrank(v)} className="mt-1.5" aria-label="Water drunk" />
        </label>
        <label className="block text-sm">Sweat lost (hot day, sport): <b>{sweat} L</b>
          <Slider value={[sweat]} min={0} max={2} step={0.1} onValueChange={([v]) => setSweat(v)} className="mt-1.5" aria-label="Sweat lost" />
        </label>
        <p className="rounded-xl bg-chem-soft px-4 py-2 text-sm">The kidneys keep the body's water in balance. Drink a lot and they make plenty of pale urine; sweat a lot on a hot Chennai afternoon and they save water, making a little dark urine. Dark urine is a sign to drink more water. The kidneys always need to pass some urine to remove urea.</p>
      </div>
      <div className="flex flex-col items-center gap-2 rounded-2xl border bg-background p-3">
        <svg viewBox="0 0 60 110" className="h-32" role="img" aria-label={`${u.volume} litres of ${u.colour} urine`}>
          <path d="M12 5 V95 Q12 105 30 105 Q48 105 48 95 V5" fill="none" stroke="#94a3b8" strokeWidth={2} />
          <rect x={14} y={105 - Math.min(95, u.volume * 30)} width={32} height={Math.min(95, u.volume * 30)} fill={u.colour === 'dark yellow' ? '#ca8a04' : u.colour === 'pale yellow' ? '#fde047' : '#fef9c3'} />
        </svg>
        <Readout label="Urine per day" value={`${u.volume} L`} />
        <Readout label="Colour" value={u.colour} />
      </div>
    </div>
  )
}
